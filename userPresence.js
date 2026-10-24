// serverId - unique per server per restart
var serverId = Random.id();


// user connections
UserPresenceSessions = new Mongo.Collection('userpresencesessions');

// list of servers
UserPresenceServers = new Mongo.Collection('userpresenceservers');


// The async collection methods exist from Meteor 2.8 on and are the only
// ones left on the server in Meteor 3, so this file uses them everywhere.
var logError = function(error) {
  console.error('userpresence:', error);
};


Meteor.startup(function() {
  Promise.all([
    UserPresenceServers.createIndexAsync({ping:1}),
    UserPresenceServers.createIndexAsync({serverId:1}),
    Meteor.users.createIndexAsync({'presence.serverId':1}),
    UserPresenceSessions.createIndexAsync({userId:1})
  ]).catch(logError);
});


// keep track of which servers are online
Meteor.setInterval(function() {
  let find = {serverId:serverId};
  let modifier = {$set: {ping:new Date()}};
  UserPresenceServers.upsertAsync(find, modifier).catch(logError);
}, 1000 * 30);


// remove old servers and sessions
// update status of users connected to that server
var removeOldServers = async function() {
  let cutoff = new Date();
  cutoff.setMinutes(new Date().getMinutes() - 5);
  let servers = await UserPresenceServers.find({ping: {$lt:cutoff}}).fetchAsync();
  for (let server of servers) {
    await UserPresenceServers.removeAsync(server._id);
    await UserPresenceSessions.removeAsync({serverId:server.serverId});
    let users = await Meteor.users.find({'presence.serverId':server.serverId}, {fields: {_id:1}}).fetchAsync();
    for (let user of users) {
      await trackUserStatus(user._id);
    }
  }
};

Meteor.setInterval(function() {
  removeOldServers().catch(logError);
}, 1000 * 10);



// track user connection and disconnection
Meteor.publish(null, async function(){
  var self = this;

  if(self.userId && self.connection && self.connection.id){
    // the session is stored before onStop is set up, so a disconnect always
    // finds it
    await userConnected(self.userId, self.connection);

    self.onStop(function(){
      userDisconnected(self.userId, self.connection).catch(logError);
    });
  }

  self.ready();
});



var userConnected = async function(userId, connection) {
  await UserPresenceSessions.insertAsync({serverId:serverId, userId:userId, connectionId:connection.id, createdAt:new Date()});
  await trackUserStatus(userId, connection);
}



var userDisconnected = async function(userId, connection) {
  await UserPresenceSessions.removeAsync({userId:userId, connectionId:connection.id});
  await trackUserStatus(userId, connection);
}



var trackUserStatus = async function(userId, connection) {
  let presence = {
    updatedAt: new Date(),
    serverId: serverId
  }

  if (connection) {
    presence.clientAddress = connection.clientAddress;
    presence.httpHeaders = connection.httpHeaders;
  }

  let isOnline = await UserPresenceSessions.find({userId:userId}).countAsync();

  if (isOnline) {
    presence.status = 'online';
  } else {
    presence.status = 'offline';
  }

  await Meteor.users.updateAsync(userId, {$set: {presence:presence}});
}
