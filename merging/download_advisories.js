#!/usr/bin/env node
'use strict';

var FS = require('fs');
var Wreck = require('wreck');

var MAX_COUNTER = 99;
var offset = 0;
var counter = 0;

var getPayload;

var savePayload = function savePayload(err, res, payload) {

  if (err) {
    throw err;
  }

  FS.writeFile('advisories_' + offset + '.json', JSON.stringify(payload));

  var total = offset + payload.count;
  if (payload && payload.count && total < payload.total) {
    offset += payload.count;
    if (++counter < MAX_COUNTER) {
      getPayload();
    }
    else {
      console.log('Reached max of ' + MAX_COUNTER);
    }
  }
  else {
    console.log('done, total:', total);
  }
};

getPayload = function getPayload() {

  var url = 'https://api.nodesecurity.io/advisories?offset=' + offset;
  console.log('GET ' + url);
  Wreck.get(url, { json:true }, savePayload);
};

getPayload();
