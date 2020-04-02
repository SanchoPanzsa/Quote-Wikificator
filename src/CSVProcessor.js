/* eslint-disable import/prefer-default-export */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-syntax */

const csv = require('csv-parser');
const fs = require('fs');

const result = [];
let wikitext = '';

const quoteLine = [
  'header',
  'subheader',
  'filename',
  'transcribe',
  'skin',
];

/**
 * Создает объект с калибровочными флагами
 * @param {Boolean} severalSkins Флаг, обозначающий, что нужно указывать несколько образов
 * @param {Boolean} customNames Флаг, обозначающий, что имена файлов пользовательские (не номера)
 */
function Flags(severalSkins, customNames) {
  this.severalSkins = severalSkins;
  this.customNames = customNames;
  return this;
}

let flags = new Flags(true, false);
let champion = '';
let mainSkin = 'Классический';

export function initializeQuoteProcessing(championName,
  skin,
  filepath,
  severalSkins = false,
  customNames = true) {
  flags = new Flags(severalSkins, customNames);
  champion = championName;
  mainSkin = skin;
  return retrieveCSV(filepath);
}

/**
 * Данная функция открывает CSV файл и передает результат записи в обработчик.
 * @param {String} filepath Путь до файла
 * @param {String} delimiter Разделитель CSV (по умолчанию ; )
 * @throws Ошибка, если указанный файл не является CSV (смотрит по расширению)
 */
function retrieveCSV(filepath, delimiter = ';') {
  if(filepath.substr(-3).toLowerCase() !== 'csv') {
    throw new SyntaxError('Файл не является CSV');
  }
  const promise = new Promise((resolve, reject) => {
    fs.createReadStream(filepath, 'utf-8')
    .pipe(csv({
      headers: quoteLine,
      skipLines: 1,
      separator: delimiter,
      /*mapValues: ({ header, value }) => {
        if(header === 'filename') {
          return value === undefined ? '' : value;
        }
        return value;
      },*/
    }))
    .on('data', data => result.push(data))
    .on('end', () => {
      wikitext = processCSV(result);
      resolve(wikitext);
    });
  });
  return promise;
}

/**
 * Данная функция формирует викитекст из данных, вытащенных из CSV файла
 * @param {Array<String>} quotes
 */
function processCSV(quotes) {
  let currentHeader = '';
  let currentSubHeader = 'Нет';
  let wikitext = '';

  for(const x of quotes) {
    wikitext += processLine(x);
  }

  function processLine(CSVLine) {
    let block = '';
    if(CSVLine.header === currentHeader) {
      if(CSVLine.subheader === currentSubHeader) {
        if(flags.severalSkins) {
          const audios = CSVLine.filename.split(',');
          const skins = CSVLine.skin.split(',');
          block += `* ${makeQuoteLine(audios[0], '', skins[0])}`;
          for(let i = 1; i < audios.length - 1; i++) {
            block += `${makeQuoteLine(audios[i], '', skins[i])}`;
          }
          block += `${makeQuoteLine(audios[audios.length - 1], CSVLine.transcribe, skins[skins.length - 1])}\r\n`;
        } else {
          block += `* ${makeQuoteLine(CSVLine.filename, CSVLine.transcribe, mainSkin)}\r\n`;
        }
      } else {
        currentSubHeader = CSVLine.subheader;
        if(currentSubHeader === 'Нет') {
          block += processLine(CSVLine);
        } else {
          block += `;${CSVLine.subheader}\r\n`;
          block += processLine(CSVLine);
        }
      }
    } else {
      currentHeader = CSVLine.header;
      currentSubHeader = 'Нет';
      block += `\r\n== ${CSVLine.header} ==\r\n`;
      block += processLine(CSVLine);
    }
    return block;
  }

  function makeQuoteLine(filename, transcribe, currentSkin = mainSkin) {
    let line = '{{фч|';
    line += !flags.customNames ? `${champion}.${currentSkin}${filename}.ogg` : `${filename}.ogg`;
    if(transcribe === '') {
      line += !flags.customNames ? `||${champion}|${currentSkin}}}` : '}}';
    } else {
      line += !flags.customNames ? `|${transcribe}|${champion}|${currentSkin}}}` : `|${transcribe}}}\r\n`;
    }
    return line;
  }
  return wikitext;
}
