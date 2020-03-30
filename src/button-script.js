/* eslint-env browser */
import {ipcRenderer} from 'electron';

const browseInput = document.getElementById('csv');
const championInput = document.getElementById('championInput');
const skinInput = document.getElementById('skinInput');
const submitButton = document.getElementById('submit');

submitButton.onclick = function() {
  const filepath = browseInput.files[0];
  const champion = championInput.value;
  const skin = skinInput.value;
  if(filepath === undefined) return;
  ipcRenderer.send('asynchronous-message', [champion, skin, filepath.path]);
};
