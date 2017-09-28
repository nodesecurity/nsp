'use strict';

const Pkg = require('../package.json');
const ProxyAgent = require('https-proxy-agent');
const Wreck = require('./wreck');

class API {
  constructor(options) {

    this._options = {
      baseUrl: options.baseUrl,
      json: true,
      headers: {
        'X-NSP-VERSION': Pkg.version
      }
    };

    if (options.proxy) {
      this._options.agent = new ProxyAgent(options.proxy);
    }

    if (options.token) {
      this._options.headers.authorization = `token ${options.token}`;
    }
  }

  check(payload) {

    return Wreck.post('/check', Object.assign({}, this._options, { payload }));
  }
}

module.exports = API;
