#!/usr/bin/env node
'use strict';

var FS = require('fs');
var Util = require('util');

// could use match on filename: file.match(/^advisories_(\d+)\.json$/)
var filesToMerge = FS.readdirSync('.').filter(file => file.indexOf('advisories') === 0 && file.indexOf('.json') > 10 && file !== 'advisories.json');
console.log(Util.inspect({ filesToMerge }));
var contents = filesToMerge.map(file => require('./' + file));
var reducer = (cum, cur) => {
  cum.results = cum.results.concat(cur.results);
  cum.total = Math.max(cum.total, cur.total);
  cum.offset = Math.min(cum.offset, cur.offset);
  cum.count += cur.count || 0;
  return cum;
};
var initial = { total:0, count:0, offset:Infinity, results: [] };
var merged = contents.reduce(reducer, initial);

var resultsTotal = merged.results.length;

if (!contents.every( cont => cont.total === merged.total )) {
  throw new Error('Total changed while downloading advisories! Not all equal to ' + merged.total);
}

var ids = merged.results.map(cont => cont.id).sort((a,b) => b - a);
var nonUnique = ids.filter( (id, num, ra) => id === ra[num + 1] );

if (nonUnique.length) {
  throw new Error(nonUnique.length +
    ' Advisory ID\'s are not unique: ' +
    ' (ids in ' + nonUnique[nonUnique.length - 1] + '..' + nonUnique[0] + ')'
  );
}

if (merged.total !== resultsTotal) {
  throw new Error('Not all advisory results downloaded, expected ' + merged.total + ' but got ' + resultsTotal);
}

FS.writeFileSync('../advisories.json', JSON.stringify(merged), 'utf-8');

console.log('Merged to ../advisories.json');
