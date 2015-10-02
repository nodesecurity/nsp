//
// Copyright (c) 2015 by ^Lift Security
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

var Commands = require('./commands');
var Rc = require('rc');
var SDK = require('requiresafe-sdk');

var aliases = {
  'ls': 'list',
  'l': 'list',
  'h': 'help'
};

// The main CLI method, accepts the command arguments and a callback
exports.run = function () {

  var config = Rc('requiresafe', {
    token: ''
  });

    // did the user specify a command?
  var passedCommand = config._[0];

    // figure out what the command was
    // default to `commands.help` if
    // not passed or not found
  var command = passedCommand && Commands[passedCommand] || Commands[aliases[passedCommand]];

  if (!command) {
    command = Commands.help;
  }

  config.api = new SDK({
    baseUrl: config.baseUrl,
    authToken: config.token,
    local: typeof config.local === 'boolean' ? config.local : false,
    proxy: process.env.HTTP_PROXY || config.proxy
  });

  config.commands = Commands;

    // Run the requested command
  return command.run(config);
};
