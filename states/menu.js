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
        game.stage.backgroundColor=0x72707A;
        this.ShowUI();
        //UIManager.createConfirmationDialog(game.world.centerX,game.world.centerY,"Welcome to my world",true).delegate = this;
    },
    update : function() {
       
    },
    ShowChat : function() {
        this.chatTile = new UIManager.UIPanel("tile4",675,185,333,384,"#72707A");
        this.chatTile.Alpha(0.85);
        
        this.chatArea = new UIManager.UITextArea("console",3,3,this.chatTile.Width()-10,this.chatTile.Height()-10);
        this.chatArea.AddStyle("font-size","20px");
        this.chatArea.UpdateObject();

        this.chatTile.Add(this.chatArea);

        UIManager.createUIElement(this.chatTile);

        this.chatInput = UIManager.createUIElement(new UIManager.UIEntry("tile5",675,578,262,38));
        this.chatButton = UIManager.createUIElement(new UIManager.UIButton("button1",945,578,64,45,"SEND"));

        this.chatButton.events.onClick.add((sender)=> {
            NetworkManager.SendChat(menuState.chatInput.Value());
            menuState.chatInput.Value("");
        },this);
    },
    ShowButtons : function() {
        
        /* Menu Options */
        this.tile1 = UIManager.createUIElement(new UIManager.UIPanel("tile1",223,185,215,240,"#72707A"));
        this.tile2 = UIManager.createUIElement(new UIManager.UIPanel("tile2",446,185,217,240,"#72707A"));
        this.tile3 = UIManager.createUIElement(new UIManager.UIPanel("tile3",223,433,440,184,"#72707A"));

        this.tile1.Alpha(0.85);
        this.tile2.Alpha(0.85);
        this.tile3.Alpha(0.85);

        this.tile1.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile1.events.onMouseLeave.add(this.tileOnOut,this);
        this.tile2.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile2.events.onMouseLeave.add(this.tileOnOut,this);

        this.tile3.events.onMouseEnter.add(this.tileOnEnter,this);
        this.tile3.events.onMouseLeave.add(this.tileOnOut,this);

        this.tile2.events.onClick.add(() => {
            NavigationManager.pushState("train",null,true);
        },this);

        this.tile1.events.onClick.add( () => {NavigationManager.pushState("battle",null,true);},this);
    },
    ShowUI : function() {
        UIManager.ClearUI();
        /* Header */
        this.navBar = new UIManager.UIPanel("navBar",0,0,GAME_WIDTH-6,125,"#226666","#FFFFFF","#226666",0);
        this.navLabel = new UIManager.UIBase("navTitle",5,0,300,50);
        this.navLabel.AddStyle("font-size","40px");
        this.navLabel.AddStyle("color","White");
        this.navLabel.AddStyle("font-family","Arial");

        this.navBar.Add(this.navLabel);
        UIManager.createUIElement(this.navBar);
        
        this.navLabel.InnerText("Project Anima");

        this.ShowButtons();
        this.ShowChat();

        
       new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Welcome to Anima!",false).Show().delegate = this;
    },
    tileOnEnter : function(sender) {
        sender.Alpha(1);
        if (sender == menuState.tile1) {
            sender._backgroundColor = "#832C65";
            menuState.navBar._backgroundColor = "#832C65";
            menuState.navBar._borderColor = menuState.navBar._backgroundColor;
            menuState.navBar.UpdateObject();
            sender.UpdateObject();
        }
        else if (sender == menuState.tile2) {
            sender._backgroundColor = "#226666";
            menuState.navBar._backgroundColor = "#226666";
            menuState.navBar._borderColor = menuState.navBar._backgroundColor;
            menuState.navBar.UpdateObject();
            sender.UpdateObject();
        }
        else if (sender == menuState.tile3) {
            sender._backgroundColor = "#AA6A39";
            menuState.navBar._backgroundColor = "#AA6A39";
            menuState.navBar._borderColor = menuState.navBar._backgroundColor;
            menuState.navBar.UpdateObject();
            sender.UpdateObject();
        }
    },
    tileOnOut : function(sender) {
        sender.Alpha(0.85);

        sender._backgroundColor = "#72707A";
        sender.UpdateObject();
    },
}

