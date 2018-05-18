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

function searchMessages() { // eslint-disable-line no-unused-vars
  var query = SpreadsheetApp.getActiveSheet().getRange('C2').getValue();
  var result = sendRequest('/search.messages?query=' + encodeURIComponent(query), 'get');

  if (result.messages.total == 0) {
    SpreadsheetApp.getUi().alert('該当件数は0件です');
    return null;
  }

  var resultValues = [['channel_id', 'timestamp', 'username', 'text', 'permallink']];
  for (var i = 0; i < result.messages.matches.length; i++) {
    resultValues.push([
      result.messages.matches[i].channel.id,
      result.messages.matches[i].ts,
      result.messages.matches[i].username,
      result.messages.matches[i].text,
      result.messages.matches[i].permalink
    ]);
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
