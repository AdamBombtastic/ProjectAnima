/** 
 * mainMenu.js
 * Date:4/6/2016
 * Programmer: Adam Austin
 * 
 * 
 * 
*/

var loginState = {
    passEntry : null,
    userEntry : null,
    loginLabel : null,
    NetworkUpdate: function(event,data) {
        console.log("World State Recieved: " + event + " " + data);
        if (event == "login") {
            console.log(data == "true" ? "Login successful!" : "Login failed!");
            if (data == "true") {
                loginState.loginSuccess();
            }
            else {
                loginState.loginFailed();
            }
        }
        /*if (event == "addRock") {
            this.AddRock(data);
        }
        else if (event == "addPlayer") {
            for (var i  = 0; i < data.length; i ++) {
                this.AddRock(data[i]);
            }
        }
    }*/},
    ConfirmationDialogFinish: function(obj) {
        obj.kill();
        this.ShowUI();
        
    },
    preload : function() {
    },
    init : function() {
        
        NetworkManager.addObserver(this);
    },
    create : function() {
        game.stage.backgroundColor=0x995544;
        NetworkManager.connect();
        
        this.ShowUI();
        //UIManager.createConfirmationDialog(game.world.centerX,game.world.centerY,"Welcome to my world",true).delegate = this;
    },
    update : function() {
       
    },
    loginFailed : function() {
        UIManager.ClearUI();
        UIManager.createConfirmationDialog(game.world.centerX, game.world.centerY, "Invalid Login",true).delegate = this;
    },
    loginSuccess : function() {
        UIManager.ClearUI();
        UIManager.createConfirmationDialog(game.world.centerX, game.world.centerY, "Welcome to Anima",true).delegate = this;
    },
    DoLogin : function() {
        var creds = {username:this.userEntry.Value(),password:this.passEntry.Value()}
        if (creds.username != "" && creds.password != "") {
            NetworkManager.TryLogin(creds);
            this.userEntry.Value("");
            this.passEntry.Value("");
        }
    },
    ShowUI : function() {

        this.loginPanel = new UIManager.UIPanel("panel",game.world.centerX-300,game.world.centerY-225,600,450);
        /*
        this.userEntry = UIManager.createUIElement(new UIManager.UIEntry("user",game.world.centerX-(125/2), game.world.centerY-50,125,25,false));
        this.passEntry = UIManager.createUIElement(new UIManager.UIEntry("pass",game.world.centerX-(125/2), this.userEntry.Y()+35,125,25,true));

        this.loginBtn = UIManager.createUIElement(new UIManager.UIButton("loginBtn",this.userEntry.X(),this.passEntry.Y()+45,128,35,"Login"));
        */
        this.userEntry = new UIManager.UIEntry("user",this.loginPanel.LocalCenterX()-(125/2), this.loginPanel.LocalCenterY()-50,125,25,false);
        this.passEntry = new UIManager.UIEntry("pass",this.userEntry.X(), this.userEntry.Y()+35,125,25,true);
        this.loginBtn = new UIManager.UIButton("loginBtn",this.userEntry.X(),this.passEntry.Y()+45,128,35,"Login");

        this.loginPanel.AddAll([this.userEntry,this.passEntry,this.loginBtn]);

        UIManager.createUIElement(this.loginPanel);

        this.userEntry.Text("Username");
        this.passEntry.Text("Password");

        this.loginBtn.DomObject().onclick= function() {
            loginState.DoLogin();
        }
    }
}

