'use strict';

const Boom = require('boom');
const Hapi = require('hapi');

process._exit = process.exit;

exports.exit = function (fn) {

  process.exit = function (code) {

    try {
      fn(code);
    }
    catch (err) {}
  };
};

exports.resetExit = function () {

  process.exit = process._exit;
};

exports.log = function (state) {

  console._log = console.log;
  console.log = function (...messages) {

    state.push(messages.join(' '));
  };
};

exports.resetLog = function () {

  if (console._log) {
    console.log = console._log;
  }
};

exports.api = function () {

  const server = new Hapi.Server();
  server.connection({ host: 'localhost' });

  server.route({
    method: 'POST',
    path: '/user/login',
    handler: function (request, reply) {

      if (request.payload.email !== 'test@user.com' ||
          request.payload.password !== 'testuser') {

        return reply(Boom.unauthorized());
      }

      return reply({
        token: 'thisisafaketoken'
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/check',
    handler: function (request, reply) {

      if (request.payload.package.name === 'clean_package') {
        return reply([]);
      }

      if (request.payload.package.name === 'single_finding') {
        return reply([{
          id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          publish_date: new Date(),
          overview: 'broken_a is vulnerable because these tests say so',
          recommendation: 'do nothing because this is just a test',
          cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
          cvss_score: 7.5,
          module: 'broken_a',
          version: '1.0.0',
          vulnerable_versions: '<=99.999.9999',
          patched_versions: '<0.0.0',
          title: 'test finding',
          path: ['clean_package@1.0.0', 'broken_a@1.0.0'],
          advisory: 'https://nodesecurity.io/advisories/1'
        }]);
      }

      if (request.payload.package.name === 'multiple_findings') {
        return reply([{
          id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          publish_date: new Date(),
          overview: 'broken_a is vulnerable because these tests say so',
          recommendation: 'do nothing because this is just a test',
          cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
          cvss_score: 7.5,
          module: 'broken_a',
          version: '1.0.0',
          vulnerable_versions: '<=99.999.9999',
          patched_versions: '<0.0.0',
          title: 'test finding',
          path: ['clean_package@1.0.0', 'broken_a@1.0.0'],
          advisory: 'https://nodesecurity.io/advisories/1'
        }, {
          id: 2,
          created_at: new Date(),
          updated_at: new Date(),
          publish_date: new Date(),
          overview: 'broken_b is vulnerable because these tests say so',
          recommendation: 'do nothing because this is just a test',
          cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
          cvss_score: 7.5,
          module: 'broken_b',
          version: '1.0.0',
          vulnerable_versions: '<=2.0.0',
          patched_versions: '>2.0.0',
          title: 'test finding',
          path: ['clean_package@1.0.0', 'broken_b@1.0.0'],
          advisory: 'https://nodesecurity.io/advisories/2'
        }]);
      }
    }
  });

  return server;
};
