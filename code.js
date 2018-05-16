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
  Logger.log(sendRequest('/search.messages?query=' + encodeURIComponent(query), 'get'));
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
