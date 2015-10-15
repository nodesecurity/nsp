'use strict';

module.exports = function (err, data) {

  if (err) {
    return 'Debug output: %j' + data + '\n' + JSON.stringify(err);
  }

  if (!data.length) {
    return;
  }

  var returnString = '';
  for (var i = 0, il = data.length; i < il; ++i) {
    returnString += JSON.stringify({
      type: 'issue',
      check_name: 'Vulnerable module "' + data[i].module + '" identified',
      description: '`' + data[i].module + '` ' + data[i].title,
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

  return returnString;
};
