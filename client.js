var NetworkManager = {
    socket : null,
    observers : [],
    isConnected : false,
    connect : function() {
        this.socket = io();
        this.isConnected = true;
        this.socket.on("login", function(message) {
            console.log("Got some data!");
            NetworkManager.broadcast("login",message);
        });
        this.socket.on("register", function(message) {
            console.log("Got some data!");
            NetworkManager.broadcast("register",message);
        });
        this.socket.on("chat", function(message) {
            console.log("Got some data!");
            NetworkManager.broadcast("chat",message);
        });
        this.socket.on("spirit", function(data) {
            console.log("Got some data!");
            NetworkManager.broadcast("spirit", data);
        });
        this.socket.on("battleUpdate",function(data) {
            console.log("Got some data!");
            NetworkManager.broadcast("battleUpdate",data);
        });
    },
    broadcast : function(event,data) {
        for (var i = 0; i < this.observers.length; i++) {
            var obj = this.observers[i];
            obj.NetworkUpdate(event,data);
        }
    },
    addObserver : function(obj) {
        this.observers.push(obj);
    },
    TryLogin : function(creds) {
        if (this.isConnected) {
            this.socket.emit("login",creds);
            console.log("Trying to log in!");
        }
    },
    TryRegister : function(creds) {
        if (this.isConnected) {
            this.socket.emit("register",creds);
            console.log("Trying to register in!");
        }
    },
    GetSpiritInfo : function () {
        if (this.isConnected) {
            this.socket.emit("spirit",{data:null});
            console.log("Asking for Spirit Data");
        }
    },
    SendChat : function(message) {
        if (this.isConnected) {
            this.socket.emit("chat",message);
            console.log("Sending chat:" + message);
        }
    },
    RequestBattle : function() {
        if (this.isConnected) {
            this.socket.emit("requestBattle","");
            console.log("Sending Matchmaking Request!");
        }
    },
    UpdateBattle : function(data) {
        if (this.isConnected) {
            this.socket.emit("battleUpdate",data);
            console.log("Sending battle update:" + data);
        }
    }   
}
function BaseObject(data) {
    this.data = data;
    this.hmy = data.hmy;
    this._loadValues = function(data) {
        for (var k in data) {
            this.data[k] = data[k];
        }
    }
    this._baseProp = function(propName,val=null) {
        if (propName != null && val == null) { // GET
            if (this.data[propName] !== undefined) {
                return this.data[propName];
            }
        }
        else if (propName != null && val != null) { //SET
            if (this.data[propName] !== undefined) {
                this.data[propName] = val;
                return this.data[propName];
            }
        }
    }
    this._loadValues(data.data);
}
function SpiritObject(data) {
    this._instData = data;
    BaseObject.call(this,data);

    this.Name = function(val=null) {
        return this._baseProp("name",val);
    }   
    this.DateCreated = function(val=null) {
        return this._baseProp("dtCreated",val);
    }
    this.OwnerId = function(val=null) {
        return this._baseProp("hOwner",val);
    }
    this.Strength = function(val=null) {
        return this._baseProp("strength",val);
    }
    this.Dexterity = function(val=null) {
        return this._baseProp("dexterity",val);
    }
    this.Intelligence = function(val=null) {
        return this._baseProp("intelligence",val);
    }
    this.Health = function(val=null) {
        return this._baseProp("health",val);
    }
    this.Mana = function(val=null) {
        return this._baseProp("mana");
    }
    this.TrainingType = function(val=null) {
        return this._baseProp("training",val);
    }
    this.DateStartedTraining = function(val=null) {
        return this._baseProp("dtStartedTraining",val);
    }
    this.TrainingDuration = function(val=null) {
        return this._baseProp("duration",val);
    }
    this.FormType = function(val = null) {
        return this._baseProp("form",val);
    }

    this.Train = function(stat) {
        //NetworkManager send train request
    }

}

var AnimaUser = {
    displayname : "",
    spirits : [],
    AddSpirit : function(spiritObj) {
        var doAdd = true;
        if (spiritObj == null) return false;
        for (var i = 0; i < this.spirits.length; i++) {
            var tObj = this.spirits[i];
            if (/*tObj.Name() == spiritObj.Name() && */tObj.DateCreated() == spiritObj.DateCreated()) {
                doAdd = false;
                //TODO: Perhaps merge similar data?
                break;
            }
        }
        if (doAdd) this.spirits.push(spiritObj);
        return doAdd;
    },
}