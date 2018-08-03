function onOpen() { // eslint-disable-line no-unused-vars
  SpreadsheetApp.getUi().createMenu('God is you')
    .addItem('Authentication', 'saveToken')
    .addToUi();
}

function saveToken() { // eslint-disable-line no-unused-vars
  var userProperties = PropertiesService.getUserProperties();
  var ui = SpreadsheetApp.getUi();

  if (userProperties.getProperty('SLACK_TOKEN')) {
    var isEntered = ui.alert('SlackのTokenは入力済みです、変更しますか？', ui.ButtonSet.YES_NO);
    if (isEntered == ui.Button.NO) {
      return;
    }
  }

  var isInput = ui.prompt('SlackのTokenを入力してください');
  if (isInput.getSelectedButton() == ui.Button.OK) {
    userProperties.setProperty('SLACK_TOKEN', isInput.getResponseText());
  }
}

function godSearch() { // eslint-disable-line no-unused-vars
  var query = SpreadsheetApp.getActiveSheet().getRange('B2').getValue();

  // クエリに該当するメッセージを取得
  var resultMessages = sendRequest('/search.messages?query=' + encodeURIComponent(query) + '&count=100&sort_dir=asc', 'get');
  Logger.log(JSON.stringify(resultMessages, null, 4));

  if (resultMessages.ok == false) {
    SpreadsheetApp.getUi().alert('処理中にエラーが発生しました');
    return false;
  }

  if (resultMessages.messages.total == 0) {
    SpreadsheetApp.getUi().alert('該当件数は0件です');
    return null;
  }

  var resultValues = [['channel_id', 'username', 'text', 'reaction', 'count']];
  for (var i = 0; i < resultMessages.messages.matches.length; i++) {

    // 各メッセージのリアクションを取得
    var resultReactions = sendRequest('/reactions.get?channel=' + resultMessages.messages.matches[i].channel.id + '&timestamp=' + resultMessages.messages.matches[i].ts, 'get');
    Logger.log(JSON.stringify(resultReactions, null, 4));

    resultValues.push([
      resultMessages.messages.matches[i].channel.name,
      resultMessages.messages.matches[i].username,
      '=HYPERLINK("' + resultMessages.messages.matches[i].permalink + '", "' + resultMessages.messages.matches[i].text + '")',
      resultReactions.message.reactions[0].name,
      resultReactions.message.reactions[0].count
    ]);
    Logger.log(JSON.stringify(resultValues, null, 4));
  }
  SpreadsheetApp.getActiveSheet().getRange(5, 1, resultValues.length, resultValues[0].length).setValues(resultValues);
}

function sendRequest(path, method, payload) { // eslint-disable-line no-unused-vars
  var url = 'https://slack.com/api' + path;
  var response = UrlFetchApp.fetch(url, {
    method             : method,
    muteHttpExceptions : true,
    contentType        : 'application/json; charset=utf-8',
    headers            : {
      Authorization : 'Bearer ' + PropertiesService.getUserProperties().getProperty('SLACK_TOKEN')
    },
    payload            : JSON.stringify(payload) || {}
  });

  if (response.getResponseCode() == 200) {
    return JSON.parse(response.getContentText());
  }

  Logger.log('Request failed. Expected 200, got %d: %s', response.getResponseCode(), response.getContentText());
  return false;
}
