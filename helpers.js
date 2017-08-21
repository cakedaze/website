'use strict';

const frontMatter = require('front-matter');
const fs = require('fs');
const path = require('path');

module.exports = {
  readMarkdown,
  getCakesData,
}

function readMarkdown(file) {
  return frontMatter(fs.readFileSync(file, 'utf8'));
}

function getCakesData(directory) {
  return fs.readdirSync(directory)
    .map(file => readMarkdown(path.join(directory, file)))
    .sort((a, b) => a.attributes.category.localeCompare(b.attributes.category));
}
