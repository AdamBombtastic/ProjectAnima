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
        else if (event == "register") {
            console.log(data ? "Registration successful!" : "Registration failed!");
            (data) ? loginState.registerSuccess() : loginState.registerFailed();
        }
        },
    ConfirmationDialogFinish: function(obj) {
        obj.kill();
        //this.ShowUI();
        
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
        var diag = new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Login Failed.",true);
        diag.Show().delegate = this;
        this.loginPanel.UpdateObject();
        //UIManager.ClearUI();
        //UIManager.createConfirmationDialog(game.world.centerX, game.world.centerY, "Invalid Login",true).delegate = this;
    },
    loginSuccess : function() {
        UIManager.ClearUI();
        
        NavigationManager.pushState("mainMenu");
    },
    registerSuccess : function() {
        new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Registration Successful",false).Show().delegate = this;
        this.loginPanel.UpdateObject();

    },
    registerFailed : function() {
        new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Registration Failed",false).Show().delegate = this;
        this.loginPanel.UpdateObject();
    },
    DoLogin : function() {
        var creds = {username:this.userEntry.Value(),password:this.passEntry.Value()}
        if (creds.username != "" && creds.password != "") {
            NetworkManager.TryLogin(creds);
            this.userEntry.Value("");
            this.passEntry.Value("");
        }
    },
    DoRegister : function() {
        var creds = {username:this.userEntry.Value(),password:this.passEntry.Value()}
        if (creds.username != "" && creds.password != "") {
            NetworkManager.TryRegister(creds);
            this.userEntry.Value("");
            this.passEntry.Value("");
        }
    },
    ShowUI : function() {

        this.loginPanel = new UIManager.UIPanel("panel",game.world.centerX-300,game.world.centerY-225,600,450);

        this.userEntry = new UIManager.UIEntry("user",this.loginPanel.LocalCenterX()-(125/2), this.loginPanel.LocalCenterY()-50,125,25,false);
        this.passEntry = new UIManager.UIEntry("pass",this.userEntry.X(), this.userEntry.Y()+35,125,25,true);
        this.loginBtn = new UIManager.UIButton("loginBtn",this.userEntry.X(),this.passEntry.Y()+45,128,35,"Login");
        
       this.testBtn = new UIManager.UIButton("testBtn",this.loginBtn.X(),this.loginBtn.Y()+45,128,35,"Register");

        this.loginPanel.AddAll([this.userEntry,this.passEntry,this.loginBtn,this.testBtn]);

        UIManager.createUIElement(this.loginPanel);

        this.userEntry.Text("Username");
        this.passEntry.Text("Password");

        this.loginBtn.events.onClick.add(function() {
            loginState.DoLogin();
        },this);

        this.testBtn.events.onClick.add(function() {
            loginState.DoRegister();
        },this);

    }
}

