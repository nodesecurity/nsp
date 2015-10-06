'use strict';

module.exports = function (err, data) {

  if (err) {
    console.error('Debug output: %j', data);
    return console.error(err);
  }

  if (!data.length) {
    return;
  }

  for (var i = 0, il = data.length; i < il; ++i) {
    console.log(JSON.stringify({
      type: 'issue',
      check_name: 'Vulnerable module "' + data[i].module + '" identified',
      description: data[i].title,
      categories: ['Security'],
      location: {
        path: 'npm-shrinkwrap.json',
        lines: {
          begin: data[i].line,
          end: data[i].line
        }
      }
    }) + '\0\n');
  }
};
