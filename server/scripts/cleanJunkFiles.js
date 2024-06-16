const mongoose = require('mongoose');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Readline = require('readline');

const Document = require('../models/document');
const config = require('../config');
const delFile = require('../utils/delFile');
const { _log, _error } = require('../utils/logging');

const rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askYesNoQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (yes[Y]/no[N]): `, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
}

mongoose
  .connect(config.MongoURL)
  .then(() => _log('MONGODB connected!'))
  .catch(_error);

const run = async () => {
  _log('Cleaning...');

  const docs = await Document.find({});

  const files = docs.map((doc) => doc.path);

  let allFiles = fs
    .readdirSync(path.join(__dirname, '../public/files'))
    .map((file) => 'public/files/' + file);

  let diff = _.difference(allFiles, files);

  if (diff.length == 0) {
    _log('No junk files!');
  } else {
    _log('Different Files', diff);

    try {
      const answer = await askYesNoQuestion(
        'Do you want to delete this files?',
      );
      if (answer === 'yes' || answer === 'y') {
        for (const dFile of diff) {
          delFile(dFile);
        }
      }
    } catch (error) {
      _error(error);
    }
    _log('All junk files cleaned!');
  }
  await rl.close();
  await mongoose.disconnect();
};

run();
