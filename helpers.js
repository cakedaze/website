'use strict';

const frontMatter = require('front-matter');
const fs = require('fs');
const path = require('path');

module.exports = {
  getAboutData,
  getCakesData,
};

function getAboutData(file) {
  return [file]
    .map(readMarkdown)
    .map(setImagePath)
    .reduce(x => x[0]);
}

function getCakesData(directory) {
  return fs
    .readdirSync(directory)
    .map(file => readMarkdown(path.join(directory, file)))
    .map(setImagePath)
    .sort((a, b) => a.attributes.category.localeCompare(b.attributes.category));
}

function readMarkdown(file) {
  return frontMatter(fs.readFileSync(file, 'utf8'));
}

function setImagePath(markdownData) {
  return Object.assign({}, markdownData, {
    attributes: Object.assign({}, markdownData.attributes, {
      image: path.join(
        '/',
        'assets',
        'media',
        path.parse(markdownData.attributes.image).base
      ),
    }),
  });
}
