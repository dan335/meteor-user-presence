Package.describe({
  name: 'danimal:userpresence',
  version: '1.0.0',
  summary: 'Track user online status across multiple servers.',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use([
    'ecmascript',
    'mongo',
    'random'
  ]);
  api.addFiles('userPresence.js', 'server');
  api.export([
    'UserPresenceSessions',
    'UserPresenceServers'
  ], 'server');
});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('tinytest');
//   api.use('userpresence');
//   api.addFiles('userpresence-tests.js');
// });
