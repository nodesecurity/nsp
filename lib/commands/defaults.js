'use strict';

module.exports = [
  {
    name: 'path',
    boolean: false,
    default: process.cwd(),
    abbr: 'p'
  },
  {
    name: 'help',
    boolean: true,
    abbr: 'h'
  },
  {
    name: 'output',
    boolean: false,
    default: require('../formatters/default'),
    abbr: 'o'
  }
];
