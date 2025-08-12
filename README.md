# 概要
召喚されると参加していないTimesチャンネルを返信するbotプログラムです。
Google Apps Scriptで作成されています。

# 使い方

## Google Apps Scriptとしてスクリプトを作成する

1. Cloneした`slack_notify_times_channel.js`をGASのエディタにコピーします。
2. GASの設定から次の2つのスクリプトプロパティを設定します。
  a. SLACK_OAUTH_TOKEN -> Slackのbotの管理ページから確認できるOAuthToken。
  b. SLACK_DEST_CHANNEL_ID -> botがメッセージを送信するChannelのID。botをChannelに参加させる必要があります。

## デプロイとSlackへの登録

1. GASをWebアプリとしてデプロイしてURLをコピーします。
2. コピーしたURLをSlackアプリのEvent Subscriptionsページに設定します。

# カスタマイズ

