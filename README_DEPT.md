# DEPTs fork of novu

## Why?

We forked novu to extend slack integration to allow to send direct messages. Default integration uses webhooks and is intended to send messages to channels.

We have had a custom slack-dm integration before, but it still needed a fork with various changes which made it hard to maintain up do date due to conflicts and architectural changes.

## How?

When a notification is triggered in [dept-notification-service](https://github.com/ExpandOnline/dept-notification-service) we get SlackMemberId based on email and store it in the subscriber credentials.
We use the default slack integration credentials, and we store the SlackMemberId in the `webhook` field.

With a small change in novu slack integration, we check `webhook` field, if it is a URL, it uses default integration, otherwise we assume it is a SlackMemberId and we use Slack API to send a direct message.

## Changes

- Added `README_DEPT.md`
- Removed all novu github workflows.
- Added `.github/workflows/deploy_next.yml`
- Added `docker/deploy/next-definition.json`
- Edit `packages/providers/src/lib/chat/slack/slack.provider.ts`
- Ensure env variables `SLACK_BOT_TOKEN` and `SLACK_CHAT_POST_MESSAGE_URL`
