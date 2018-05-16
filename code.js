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
