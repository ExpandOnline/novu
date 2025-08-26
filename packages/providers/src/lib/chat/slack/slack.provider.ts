import { ChatProviderIdEnum } from '@novu/shared';
import { ChannelTypeEnum, IChatOptions, IChatProvider, ISendMessageSuccessResponse } from '@novu/stateless';
import axios from 'axios';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { WithPassthrough } from '../../../utils/types';

export class SlackProvider extends BaseProvider implements IChatProvider {
  channelType = ChannelTypeEnum.CHAT as ChannelTypeEnum.CHAT;
  protected casing: CasingEnum = CasingEnum.SNAKE_CASE;
  public id = ChatProviderIdEnum.Slack;
  private axiosInstance = axios.create();

  async sendMessage(
    data: IChatOptions,
    bridgeProviderData: WithPassthrough<Record<string, unknown>> = {}
  ): Promise<ISendMessageSuccessResponse> {
    const { webhookUrl, content, blocks, customData } = data;

    if (webhookUrl && webhookUrl.startsWith('http')) {
      // Default webhook
      const response = await this.axiosInstance.post(
        webhookUrl,
        this.transform(bridgeProviderData, {
          text: content,
          blocks: blocks,
          ...(customData || {}),
        }).body
      );

      return {
        id: response.headers['x-slack-req-id'],
        date: new Date().toISOString(),
      };
    } else if (webhookUrl) {
      // Assume it is a slack member ID
      const slackMemberId = webhookUrl;

      const slackToken = process.env.SLACK_BOT_TOKEN;
      const slackChatPostMEssageUrl = process.env.SLACK_CHAT_POST_MESSAGE_URL;

      if (!slackToken) {
        throw {
          message: `Error sending slack DM: missing env variable SLACK_BOT_TOKEN`,
        };
      }
      if (!slackChatPostMEssageUrl) {
        throw {
          message: `Error sending slack DM: missing env variable SLACK_CHAT_POST_MESSAGE_URL`,
        };
      }

      const response = await this.axiosInstance.post(
        slackChatPostMEssageUrl,
        {
          channel: slackMemberId,
          text: content,
          blocks,
          ...(customData || {}),
        },
        {
          headers: {
            Authorization: `Bearer ${slackToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw { message: `Slack API error: ${response.data.error}` };
      }

      return {
        id: response.data.ts,
        date: new Date().toISOString(),
      };
    }
  }
}
