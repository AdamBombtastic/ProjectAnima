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
    }   
}
