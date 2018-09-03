

const express= require('express')
const sqlite=require('sqlite3').verbose();
const myUtil=require('./DataClasses');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var DEBUG = true;

const PORT = 8000;
/*
* DATE: 9/3/2018
* TODO: Refactor the BattleManager code & event parsing
        Remove players from rooms when they disconnect
        Keep track of stats from combat
        Win/Lose
        Allow players to create their own rooms
        Add Battle Spells
        Make stats of the spirit matter in battle
*/

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

var tickRate = 10;

var battleQueue = [];

var userCount = 0;

http.listen(PORT, function(){
    console.log('listening on *:' + PORT);
  });

  io.on("connection",function(socket) {
      console.log("Another soul dropped in. . ." + socket.id);
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
            removeFromBattleQueue(socket);
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
      socket.on("requestBattle",(data) => {
        AddToBattleQueue(socket,data);
      });
      socket.on("battleUpdate",(data) => {
        if (data != null && data.type != null) {
          var checkRoom = null;
          if (data.type == BATTLE_REQUEST.MOVE && data.direction != null) {
            checkRoom = BattleRoomManager.TryMovePlayer(socket.id,data.direction);
          } 
          else if (data.type == BATTLE_REQUEST.ATTACK) {
            checkRoom = BattleRoomManager.TryAddAttack(socket.id);
          }
          if (checkRoom != null) {
            for (var i = 0; i < checkRoom.sockets.length; i++) {
              var mySocket = checkRoom.sockets[i];
              var myPlayer = users[mySocket.id];
              mySocket.emit("battleUpdate",{players : checkRoom.players, objects : checkRoom.objects});
            }
            checkRoom.objects = []; //clear dead objects
          }
        }
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

  async function AddToBattleQueue(socket,data) {
    battleQueue.push(socket);
    var checkRoom = checkForBattle();
    if (checkRoom != null) {
      for (var i = 0; i < checkRoom.sockets.length; i++) {
        var mySocket = checkRoom.sockets[i];
        var myPlayer = users[mySocket.id];
        mySocket.emit("battleUpdate",{players : checkRoom.players, objects : checkRoom.objects});
      }
    }
  }
  function removeFromBattleQueue(socket) {
    var myIndex = battleQueue.indexOf(socket);
    if (myIndex != -1) battleQueue.splice(myIndex,1);
  }

  function checkForBattle() {
    if (battleQueue.length > 1) {
      var players = battleQueue.splice(0,2);
      return BattleRoomManager.createBattleRoom(players);
    
    }
    return null;
  }

/** Grid Combat Test! **/
var BattleRoomManager = {
  roomMap : {},
  rooms : [],
  roomCount : 0,
  createBattleRoom : function(playerSockets) {
    var mBattleRoom = {}
    mBattleRoom.roomId = BattleRoomManager.roomCount;
    mBattleRoom.sockets = playerSockets;
    mBattleRoom.players = [];
    mBattleRoom.objects = [];
    for (var i = 0; i < playerSockets.length; i++) {
      var myPlayer = users[playerSockets[i].id];
      myPlayer.battleInfo = {key: playerSockets[i].id, x: 0, y: 0,health: 100, battleOrder : i, roomId : BattleRoomManager.roomCount}
      if (i > 0) myPlayer.battleInfo.x = 5;
      mBattleRoom.players.push(myPlayer.battleInfo);
    }
    BattleRoomManager.roomMap[BattleRoomManager.roomCount] = mBattleRoom;
    BattleRoomManager.rooms.push(mBattleRoom);
    BattleRoomManager.roomCount =+ 1;
    return mBattleRoom;
  },
  TryAddAttack : function(key) {
    var myPlayer = users[key];
    if (myPlayer.battleInfo != null && myPlayer.battleInfo.roomId != null && this.roomMap[myPlayer.battleInfo.roomId] != null) {
      var myRoom = this.roomMap[myPlayer.battleInfo.roomId];
      myRoom.objects.push({type: EFFECT_TYPES.BLAST, x: myPlayer.battleInfo.x, y : myPlayer.battleInfo.y});
      for (var i = 0; i < myRoom.players.length; i++) {
        var tempPlayer = myRoom.players[i];
        if (tempPlayer.key !=  myPlayer.battleInfo.key && tempPlayer.y == myPlayer.battleInfo.y) {
          myRoom.objects.push({type: EFFECT_TYPES.EXPLOSTION, x : tempPlayer.x, y : tempPlayer.y});
          tempPlayer.health -= 5;
        }
      }
      return myRoom; //return the room;
    }
    return null;
  },
  TryMovePlayer : function(key, dir) {
    var myPlayer = users[key];
    if (myPlayer.battleInfo != null && myPlayer.battleInfo.roomId != null && this.roomMap[myPlayer.battleInfo.roomId] != null) {
      //valid player and valid room
      var x = myPlayer.battleInfo.x;
      var y = myPlayer.battleInfo.y;

      switch (dir) {
        case GRID_DIRECTIONS.UP:
          y-=1;
          break;
        case GRID_DIRECTIONS.DOWN:
          y+=1;
          break;
        case GRID_DIRECTIONS.LEFT:
          x-=1;
          break;
        case GRID_DIRECTIONS.RIGHT:
          x+=1;
          break;
        default:
      }
      if (myPlayer.battleInfo.battleOrder == 0) {
        myPlayer.battleInfo.x = (x >= 0 && x < 3) ? x : myPlayer.battleInfo.x;
        myPlayer.battleInfo.y = (y >= 0 && y < 3) ? y : myPlayer.battleInfo.y;
        
      }
      else {
        myPlayer.battleInfo.x = (x > 2 && x < 6) ? x : myPlayer.battleInfo.x;
        myPlayer.battleInfo.y = (y >= 0 && y < 3) ? y : myPlayer.battleInfo.y;
      }
      return this.roomMap[myPlayer.battleInfo.roomId]; //return the room;
    }
    
  },
}
var GRID_DIRECTIONS = {
    UP : 0,
    DOWN : 1,
    LEFT : 2,
    RIGHT : 3
}
var BATTLE_REQUEST = {
  MOVE : 0,
  ATTACK : 1,
}
var EFFECT_TYPES =  {
  BLAST : 0,
  EXPLOSTION : 1,
}