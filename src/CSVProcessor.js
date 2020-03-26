const csv = require('csv-parser');
const fs = require('fs');

const result = [];

function retrieveCSV(filepath = process.argv[0]) {
  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', data => result.push(data))
    .on('end', () => {});
}

retrieveCSV('Lines.csv');
