'use strict';

module.exports = function (err, data, pkgPath) {

  if (err) {
    return err.stack;
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
      remediation_points: 300000,
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
