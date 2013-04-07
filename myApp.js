Messages = new Meteor.Collection("messages");
Online = new Meteor.Collection("online");
Connections = new Meteor.Collection("connections");
numUsers = 0

if (Meteor.isClient) {

  Template.display.messages = function () {
    return Messages.find({}, {sort: {date_created: 1}});
  };

  Template.online.users = function () {
    return Online.find({}, {sort: {date_created: -1}})
  }

  // client code: ping heartbeat every 5 seconds
  Meteor.setInterval(function () {
    Meteor.call('keepalive', Session.get('id'));
  }, 1000);

  Template.input.events({

    "keypress #input" : function (e) {
      if (e['shiftKey'] && e.which == 13) {
        null
      }
      else if (e.which == 13) {
        e.preventDefault()
        textarea = document.getElementsByTagName('textarea')[0]
        Messages.insert({
          message: textarea.value,
          date_created: Date.parse(Date()),
          creator: Session.get("name")
        });
        textarea.value = "";
      }
    },
    "click #kill" : function () {
      Messages.remove({})
    }
  });


  Meteor.startup(function () {
    var user_name = String(prompt("What is your name?", "Bob"))
    Session.setDefault("name", user_name)
    Session.set("id", numUsers)
    Online.insert({
      name: user_name, 
      joined: Date.parse(Date()),
      id: numUsers,
      last_seen: (new Date()).getTime()
    })
    numUsers += 1

    $(window).bind('beforeunload', function() {
      Online.remove({id: Session.get("id")})
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // Online.remove({})

  });
  // server code: heartbeat method
  Meteor.methods({
    keepalive: function (user_id) {
      Online.update({id: user_id}, {$set: {last_seen: (new Date()).getTime()}})
    }
  });

  // server code: clean up dead clients after 1 second
  Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    var inactiveUsers = Online.find({last_seen: {$lt: (now - 2000)}})

  });
}
