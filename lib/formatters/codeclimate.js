'use strict';

module.exports = function (err, data) {

  if (err) {
    return {
      result: 'Debug output: %j' + data + '\n' + JSON.stringify(err),
      exitCode: 1
    };
  }

  if (!data.length) {
    return {
      exitCode: 1
    };
  }

  var returnString = '';
  for (var i = 0, il = data.length; i < il; ++i) {
    returnString += JSON.stringify({
      type: 'issue',
      check_name: 'Vulnerable module "' + data[i].module + '" identified',
      description: data[i].title,
      categories: ['Security'],
      content: {
        body: data[i].content
      },
      location: {
        path: 'npm-shrinkwrap.json',
        lines: {
          begin: data[i].line.start,
          end: data[i].line.end
        }
      }
    }) + '\0\n';
  }

  return {
    result: returnString,
    exitCode: 0
  };
};
