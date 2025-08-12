function doPost(e) {
  let params = JSON.parse(e.postData.getDataAsString());

  if (params.type == 'url_verification') {
    return ContentService.createTextOutput(params.challenge);
  }

  if (params.event && params.event.type == 'message' && !params.event.subtype) {
    handleEvent(params.event);
  }

  ContentService.createTextOutput(JSON.stringify({ "challenge": params.challenge }));
  
}


function handleEvent(event){

  if(event.text.includes('人工無能召喚')){
    send_reply(event);
  }

}

function send_reply(event){

  const slack_oauth_token = PropertiesService.getScriptProperties().getProperty('SLACK_OAUTH_TOKEN');
  const slack_dest_channel_id = PropertiesService.getScriptProperties().getProperty('SLACK_DEST_CHANNEL_ID');

  const all_times_channels = get_all_times_channels(slack_oauth_token);
  const not_joined_times_channels  = get_not_joined_times_channels(slack_oauth_token, event.user, all_times_channels);

  let response_message = '<@' + event.user + '>\n\n人工無能見参！！\n\n';

  if(not_joined_times_channels.length > 0){
    response_message = response_message + get_user_display_name(slack_oauth_token, event.user) + 'さんが参加していないSlackチャンネルをお知らせします\n\n';

    not_joined_times_channels.forEach((channel) => 
    {
      response_message = response_message + get_user_display_name(slack_oauth_token, channel[1]) + 'さんの<#' + channel[0] + '>\n';
    }
    )

    response_message = response_message + '\nぜひ新しいTimesチャンネルに参加してコミュニケーションの輪を拡げましょう！';

  }else{
    response_message = response_message + 'すばらしい！！\n' + get_user_display_name(slack_oauth_token, event.user) + 'さんはいまある全てのTimesチャンネルに参加しています';
  }

  let slack_chat_post_message_api = 'https://slack.com/api/chat.postMessage';
  let headers = {'Authorization': 'Bearer ' + slack_oauth_token, 'Content-types': 'application/json; charset=UTF-8'};
  let payload = {'channel': slack_dest_channel_id, 'thread_ts': event.ts, 'text': response_message};
  let options = {'method': 'POST', 'headers': headers, 'payload': payload};

  UrlFetchApp.fetch(slack_chat_post_message_api, options);

}

function get_all_times_channels(slack_oauth_token){

  const slack_conversations_api_url = 'https://slack.com/api/conversations.list?exclude_archived=true&limit=1000';
  const headers = {'Authorization': 'Bearer ' + slack_oauth_token};
  const options = {'headers': headers};

  const channels = JSON.parse(UrlFetchApp.fetch(slack_conversations_api_url, options).toString()).channels;

  let times_channels = [];

  channels.forEach((channel) =>
  {
    if(channel.name.match(/^z-times-/)){
      times_channels.push([channel.id, channel.creator]);
    }
  }
  )

  return times_channels;

}

function get_not_joined_times_channels(slack_oauth_token, slack_target_user_id, all_times_channels){

  const slack_conversations_memers_api = 'https://slack.com/api/conversations.members'
  const headers = {'Authorization': 'Bearer ' + slack_oauth_token};
  const options = {'headers': headers};

  let not_joined_times_channels = [];

  all_times_channels.forEach((channel) =>
  {
    let channel_id = channel[0];
    let channel_creator = channel[1];
    let req_api = slack_conversations_memers_api + '?channel=' + channel_id + '&limit=200';
    let response = JSON.parse(UrlFetchApp.fetch(req_api, options).getContentText())
    let members = response.members;

    if(!members.includes(slack_target_user_id)){
      not_joined_times_channels.push([channel_id, channel_creator]);
    }
  }
  )

  return not_joined_times_channels;
}


function get_user_display_name(slack_oauth_token, slack_user_id){

  // SlackのUsers.info APIのURLを代入します
  const slackusers_info_api_url = 'https://slack.com/api/users.info?user=' + slack_user_id;

  // API呼び出し時のヘッダをオプションとして代入します
  const headers = {'Authorization': 'Bearer ' + slack_oauth_token};
  const options = {'headers': headers};

  // APIを呼び出し結果を代入します
  const response = JSON.parse(UrlFetchApp.fetch(slackusers_info_api_url, options).toString());

  // API呼び出し結果からDisplay Nameを取り出します
  user_display_name = response.user.profile.display_name;

  // Display Nameが未設定だったときは、代わりにReal Nameを取得して代入します
  if(user_display_name.length == 0){
    user_display_name = response.user.profile.real_name;
  }

  // 取得したDisplay Nameを返します
  return user_display_name;
}