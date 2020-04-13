/* eslint-env browser */
import { ipcRenderer } from 'electron';

const browseInput = document.getElementById('csv');
const championInput = document.getElementById('championInput');
const skinInput = document.getElementById('skinInput');
const severalSkinsCheck = document.getElementById('severalSkins');
const customNamesCheck = document.getElementById('customNames');
const textOnlyCheck = document.getElementById('textOnly');
const submitButton = document.getElementById('submit');
const infoArea = document.getElementById('infoArea');

submitButton.onclick = function() {
  const filepath = browseInput.files[0];
  const champion = championInput.value;
  const skin = skinInput.value;
  const severalSkins = severalSkinsCheck.checked;
  const customNames = customNamesCheck.checked;
  const textOnly = textOnlyCheck.checked;
  if(filepath === undefined) {
    addMessage('Не указан файл');
    return;
  }

  if(filepath.name.substr(-3).toLowerCase() !== 'csv') {
    addMessage('Указанный файл не является CSV');
    return;
  }

  if(champion === undefined) {
    addMessage('Не указан чемпион');
    return;
  }

  if(severalSkins) {
    addMessage('Будут добавляться варианты образов');
  }

  if(customNames) {
    addMessage('Используются пользовательские имена');
  }

  if(textOnly) {
    addMessage('Создается текст без разметки');
  }

  ipcRenderer.send('asynchronous-message', [champion, skin, filepath.path, severalSkins, customNames, textOnly]);
  addMessage('Файл обрабатывается');
};

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  addMessage(arg);
});

/**
 * Добавляет в конец текстового блока сообщение
 * @param {String} message Сообщение
 */
function addMessage(message) {
  infoArea.value += `${message}\r\n`;
}
