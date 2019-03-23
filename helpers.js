'use strict';

const frontMatter = require('front-matter');
const fs = require('fs');
const path = require('path');

module.exports = {
  getAboutData,
  getCakesData,
  getEventsData,
};

function getAboutData(file) {
  return [file]
    .map(readMarkdown)
    .reduce(x => x[0]);
}

function getCakesData(directory) {
  return fs
    .readdirSync(directory)
    .map(file => readMarkdown(path.join(directory, file)))
    .sort((a, b) => a.attributes.category.localeCompare(b.attributes.category));
}

function getEventsData(directory) {
  return fs
    .readdirSync(directory)
    .map(file => readMarkdown(path.join(directory, file)));
}

function readMarkdown(file) {
  return frontMatter(fs.readFileSync(file, 'utf8'));
}
