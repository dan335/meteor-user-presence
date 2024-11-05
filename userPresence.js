// serverId - unique per server per restart
var serverId = Random.id();


// user connections
UserPresenceSessions = new Mongo.Collection('userpresencesessions');

// list of servers
UserPresenceServers = new Mongo.Collection('userpresenceservers');


UserPresenceServers.createIndex({ping:1});
UserPresenceServers.createIndex({serverId:1});
Meteor.users.createIndex({'presence.serverId':1});
UserPresenceSessions.createIndex({userId:1});


// keep track of which servers are online
Meteor.setInterval(async function() {
  let find = {serverId:serverId};
  let modifier = {$set: {ping:new Date()}};
  await UserPresenceServers.upsertAsync(find, modifier);
}, 1000 * 30);


// remove old servers and sessions
// update status of users connected to that server
Meteor.setInterval(async function() {
  let cutoff = new Date();
  cutoff.setMinutes(new Date().getMinutes() - 5);
  UserPresenceServers.find({ping: {$lt:cutoff}}).forEachAsync(async function(server) {
    await UserPresenceServers.removeAsync(server._id);
    await UserPresenceSessions.removeAsync({serverId:server.serverId});
    Meteor.users.find({'presence.serverId':server.serverId}).forEachAsync(async function(user) {
     await trackUserStatus(user._id);
    })
  })
}, 1000 * 10);



// track user connection and disconnection
Meteor.publish(null, async function(){
  var self = this;

  if(self.userId && self.connection && self.connection.id){
   await userConnected(self.userId, self.connection);

    self.onStop(async function(){
      await userDisconnected(self.userId, self.connection);
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
