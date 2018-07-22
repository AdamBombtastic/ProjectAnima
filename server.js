

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
          var myObject = new myUtil.DataObject(db);
          var ans = await myObject.ReadWhere(["username","password"],[myUtil.MD5(message.username+myUtil.MD5Salt),myUtil.MD5(message.password+myUtil.MD5Salt)]);
          if (ans) {
            if (DEBUG) console.log("<Debug> Login succesful");
            socket.emit("login","true");
          }
          else {
            if (DEBUG) console.log("<Debug> Login failed");
            socket.emit("login","false");
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
  });
async function TryRegister(socket,creds) {
  var myObject = new myUtil.DataObject(db);
  var isPresent = await myObject.ReadWhere(["username","password"],[myUtil.MD5(creds.username+myUtil.MD5Salt),myUtil.MD5(creds.password+myUtil.MD5Salt)]);
  var result = false;
  if (!isPresent) {
      myObject.data.username=myUtil.MD5(creds.username+myUtil.MD5Salt);
      myObject.data.password=myUtil.MD5(creds.password+myUtil.MD5Salt);
      result = await myObject.Post();
  }
  socket.emit("register",result);
  if (DEBUG) {
    console.log("<Debug> Registration Success? " + result);
  }
  return result;
}

