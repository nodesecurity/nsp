'use strict';

const Fs = require('fs');
const Path = require('path');
const ProxyAgent = require('https-proxy-agent');

const Command = require('../lib/command');
const Wreck = require('../lib/wreck');

const internals = {};
internals.fetch = function (baseUrl, agent, offset = 0, items = []) {

  return Wreck.get(`/advisories?offset=${offset}`, { baseUrl, json: true, agent }).then((res) => {

    if (res.data.total > res.data.count + res.data.offset) {
      return internals.fetch(baseUrl, agent, res.data.offset + res.data.count, items.concat(res.data.results));
    }

    return items.concat(res.data.results);
  });
};

exports.command = 'gather';
exports.description = 'gathers current advisories into a json file for offline checks';

exports.builder = {
  path: {
    description: 'location to save advisories database',
    group: 'Locations:'
  }
};

exports.handler = Command.wrap('gather', (args) => {

  const path = args.path.endsWith('advisories.json') ? args.path : Path.join(args.path, 'advisories.json');

  let agent;
  if (args.proxy) {
    agent = new ProxyAgent(args.proxy);
  }

  return internals.fetch(args.baseUrl, agent).then((items) => {

    Fs.writeFileSync(path, JSON.stringify(items, null, 2), 'utf8');
    return {
      message: 'Successfully saved advisories.json'
    };
  });
});
