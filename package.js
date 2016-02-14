Package.describe({
  name: 'danimal:userpresence',
  version: '1.0.1',
  summary: 'Track user online status across multiple servers.',
  git: 'https://github.com/dan335/meteor-user-presence',
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
