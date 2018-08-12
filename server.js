

const express= require('express')
const sqlite=require('sqlite3').verbose();
const myUtil=require('./DataClasses');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var DEBUG = true;

const PORT = 8000;

/** 
 * 
 * Serve the files 
 * 
 */
app.use(express.static(__dirname+'/'));

/** 
 * 
 * Set-up the DB 
 * 
 */
var db = new sqlite.Database("./db/animadb.db",sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
  if (err) {console.log("Error:" + err.message);}
  else console.log("Database. . . Connected!");
});

/*

DataObject usage:
var myObject = new myUtil.DataObject(db);
myObject.Read(1).then(function() {
  console.log(myObject);
});
*/
 
/** 
 * 
 * Handle Requests
 * 
 */

var users = {};
var userCount = 0;

http.listen(PORT, function(){
    console.log('listening on *:' + PORT);
  });

  io.on("connection",function(socket) {
      console.log("Another soul dropped in. . .");
      socket.on("login",(message) => {
        if (DEBUG) {
          console.log("<Debug> Request type: login");
          console.log(message);
        }
        (async ()=> {
          var myObject = new myUtil.UserObject(db);
          var ans = await myObject.ReadWhere(["username","password"],[myUtil.MD5(message.username+myUtil.MD5Salt),myUtil.MD5(message.password+myUtil.MD5Salt)]);
          if (ans) {
            if (DEBUG) console.log("<Debug> Login succesful");
            
            users[socket.id] = myObject;
            if (myObject.data.displayname == null) {
              myObject.DisplayName("User"+myObject.hmy); 
            }
            myObject.DateLastLoggedIn(Date.now());

            userCount+=1;
            socket.emit("login",{success: true, displayname: myObject.data.displayname});
            console.log(myObject);
          }
          else {
            if (DEBUG) console.log("<Debug> Login failed");
            socket.emit("login",{success: false});
          }
        })();
      });
      socket.on("disconnect",(reason)=> {
          (async ()=> {
          console.log("User disconnected! Saving data . . .");
          var myUser = users[socket.id];
          if (myUser != null) {
            await myUser.Post();
          }
        })();
      });
      socket.on("register",(message) => {
        if (DEBUG) {
          console.log("<Debug> Request type: register");
          console.log(message);
        }
        TryRegister(socket,message);
      });
      socket.on("chat",(data) => {
        if (DEBUG) {
          console.log("<Debug> Request type: chat");
          console.log(data);
        }
        ParseChat(socket,data);

      });
      socket.on("spirit",(data) => {
        TryGetSpirits(socket,data);
      });
  });
async function TryRegister(socket,creds) {
  var myObject = new myUtil.UserObject(db);
  var isPresent = await myObject.ReadWhere(["username","password"],[myUtil.MD5(creds.username+myUtil.MD5Salt),myUtil.MD5(creds.password+myUtil.MD5Salt)]);
  var result = false;
  if (!isPresent) {
      myObject.Username(myUtil.MD5(creds.username+myUtil.MD5Salt));
      myObject.Password(myUtil.MD5(creds.password+myUtil.MD5Salt));
      myObject.DisplayName(creds.username);
      myObject.DateCreated(Date.now());
      myObject.DateLastLoggedIn(0);
      result = await myObject.Post();
  }
  socket.emit("register",result);
  if (DEBUG) {
    console.log("<Debug> Registration Success? " + result);
  }
  return result;
}
async function ParseChat(socket,data) {
  var myUser = users[socket.id];
  var message = {username : myUser.data.displayname, message: data}
  io.emit("chat",message);
}
async function TryGetSpirits(socket,data) {
  var myUser = users[socket.id];
  if (myUser != null) {
    var spirits = await myUser.Spirits();
    if (spirits == null || spirits.length == 0 || spirits == false) {
      spirits = [];
      var mySpirit =  await (CreateSpirit(socket,data));
      spirits.push(mySpirit.data);
    }
    if (DEBUG) {
      console.log("<Debug> Sending spirit info ")
      console.log(spirits);
    }
    socket.emit("spirit",{data: spirits});
  }
}
async function CreateSpirit(socket,data) {
    var myUser = users[socket.id];
    var mySpirit = new myUtil.SpiritOject(db);
    mySpirit.Name("Little Spirit");
    mySpirit.DateCreated(Date.now());
    mySpirit.OwnerId(myUser.hmy);
    var success = await mySpirit.Post();
    return mySpirit;
  }
