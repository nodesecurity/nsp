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
      content: data[i].content,
      location: {
        path: 'npm-shrinkwrap.json',
        lines: {
          begin: data[i].line.start,
          end: data[i].line.end
        }
      }
    }) + '\0\n');
  }
};
