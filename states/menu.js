/** 
 * mainMenu.js
 * Date:4/6/2016
 * Programmer: Adam Austin
 * 
 * 
 * 
*/

var menuState = {
    tile1 : null,
    tile2 : null,
    tile3 : null,
    NetworkUpdate: function(event,data) {
        console.log("World State Recieved: " + event + " " + data);
        if (event == "chat") {
            this.chatArea.AppendLine(data.username + ": " + data.message);
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
        game.stage.backgroundColor="3F3075";
        
        this.ShowUI();
        //UIManager.createConfirmationDialog(game.world.centerX,game.world.centerY,"Welcome to my world",true).delegate = this;
    },
    update : function() {
       
    },
    
    ShowUI : function() {
        /* Menu Options */
        this.tile1 = UIManager.createUIElement(new UIManager.UIPanel("tile1",223,135,215,240,"#72707A"));
        this.tile2 = UIManager.createUIElement(new UIManager.UIPanel("tile2",446,135,217,240,"#72707A"));
        this.tile3 = UIManager.createUIElement(new UIManager.UIPanel("tile3",223,383,440,184,"#72707A"));

        this.tile1.Alpha(0.85);
        this.tile2.Alpha(0.85);
        this.tile3.Alpha(0.85);

        this.tile1.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile1.events.onMouseLeave.add(this.tileOnOut,this);
        this.tile2.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile2.events.onMouseLeave.add(this.tileOnOut,this);

        this.tile3.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile3.events.onMouseLeave.add(this.tileOnOut,this);

        this.chatTile = new UIManager.UIPanel("tile4",675,135,333,384,"#72707A");
        this.chatTile.Alpha(0.85);
        
        this.chatArea = new UIManager.UITextArea("console",3,3,this.chatTile.Width()-10,this.chatTile.Height()-10);

        this.chatTile.Add(this.chatArea);

        UIManager.createUIElement(this.chatTile);

        this.chatInput = UIManager.createUIElement(new UIManager.UIEntry("tile5",675,528,262,38));
        this.chatButton = UIManager.createUIElement(new UIManager.UIButton("button1",945,528,64,45,"SEND"));

        this.chatButton.events.onClick.add((sender)=> {
            NetworkManager.SendChat(menuState.chatInput.Value());
            menuState.chatInput.Value("");
        },this);
       new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Welcome to Anima!",false).Show().delegate = this;
    },
    tileOnEnter : function(sender) {
        sender.Alpha(1);
        if (sender == menuState.tile1) {
            sender._backgroundColor = "#832C65";
            sender.UpdateObject();
        }
        else if (sender == menuState.tile2) {
            sender._backgroundColor = "#226666";
            sender.UpdateObject();
        }
        else if (sender == menuState.tile3) {
            sender._backgroundColor = "#AA6A39";
            sender.UpdateObject();
        }
    },
    tileOnOut : function(sender) {
        sender.Alpha(0.85);

        sender._backgroundColor = "#72707A";
        sender.UpdateObject();
    },
}

