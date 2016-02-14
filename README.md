User Presence
---
Track user online status over multiple servers.  No setup needed.  Very simple and scalable.  Adds a 'presence' field to Meteor.users.  User.presence.status will be either 'online' or 'offline'.  Works across multiple servers and handles servers going offline or crashing.

    user: {
      presence: {
        status: 'online'
        updatedAt: Sun Feb 14 2016 11:12:07 GMT+0700 (ICT),
        serverId: 'dzJbbTZvXEbNXFYwh',
        clientAddress: '127.0.0.1',
        httpHeaders: {
          'x-forwarded-for': '127.0.0.1',
          host: 'localhost:3000',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36',
          'accept-language': 'en-US,en;q=0.8'
        },
      }
    }
