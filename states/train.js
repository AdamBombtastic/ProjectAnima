/** 
 * mainMenu.js
 * Date:4/6/2016
 * Programmer: Adam Austin
 * 
 * 
 * 
*/

var trainState = {
    NetworkUpdate: function(event,data) {
        console.log("World State Recieved: " + event + " " + data);
        if (event == "chat") {
            this.chatArea.AppendLine(data.username + ": " + data.message);
        }
        else if (event == "spirit") {
            //Stuff
            console.log(data);
            if (data != null && data.data != null) {
                for (var i = 0; i < data.data.length; i++) {
                    AnimaUser.AddSpirit(new SpiritObject(data.data[i]));
                }
            }
            this.ShowUI();
        }
        },
    ConfirmationDialogFinish: function(obj) {
        obj.kill();
        //this.ShowUI();
        
    },
    preload : function() {
        game.load.spritesheet("spirit_basic","graphics\\spirit_base.png",32,32,6);
    },
    init : function() {
        
        NetworkManager.addObserver(this);
        
        
    },
    create : function() {
        game.stage.backgroundColor=0x72707A;
        
        NetworkManager.GetSpiritInfo();
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
    AddCircleStyle(myUIObj) {
        myUIObj.AddStyle("font-size","26px");
        myUIObj.AddStyle("font-family","Arial");
        myUIObj.AddStyle("text-align","center");
        myUIObj.AddStyle("vertial-align","middle");
        myUIObj.AddStyle("border-radius","100px");
        myUIObj.AddStyle("border-width","0px");
        myUIObj.AddStyle("line-height",myUIObj.Height()+"px");
    },
    ShowUI : function() {
        //TODO: Add the progress bar so we can actually train up their different stats
        UIManager.ClearUI();
        /* Header */
        this.navBar = new UIManager.UIPanel("navBar",0,0,GAME_WIDTH-6,125,"#226666","#FFFFFF","#226666");
        this.navLabel = new UIManager.UIBase("navTitle",5,0,300,50);
        this.navLabel.AddStyle("font-size","40px");
        this.navLabel.AddStyle("color","White");
        this.navLabel.AddStyle("font-family","Arial");

        this.navBar.Add(this.navLabel);
        UIManager.createUIElement(this.navBar);
        
        this.navLabel.InnerText("Project Anima");

        this.ShowChat();

        this.trainingPanel = UIManager.createUIPanel(200,185,460,384+50,0xFFFFFF,0xFFFFFF,0.5,0.5,1);
        this.trainingPanel
        this.spirit = {}
        this.spirit.sprite = game.add.sprite(200,185,"spirit_basic",0);
        this.spirit.sprite.scale.setTo(3,3);
        var mySprite = this.spirit.sprite;

        mySprite.centerX= this.trainingPanel.centerX;
        mySprite.centerY = this.trainingPanel.centerY-32;

        var idleAnim = mySprite.animations.add('idle',[0,1,2,1,0,1,2,1,0]);
        mySprite.inputEnabled= true;
        mySprite.events.onInputDown.add(function() {
            idleAnim.play(10,false);
        },this);
        

        var lblSpiritName = UIManager.createUIElement(new UIManager.UIBase("lblSpiritName",200,185,200,25));
        lblSpiritName.InnerText("Little Spirit");
        lblSpiritName.AddStyle("font-size","24px");
        lblSpiritName.AddStyle("font-family","Arial");
        lblSpiritName.AddStyle("text-align","center");
        lblSpiritName.UpdateObject();
        lblSpiritName.CenterX(this.trainingPanel.centerX);
        lblSpiritName.Y(mySprite.y - 64);


        var lblSpiritStatus = UIManager.createUIElement(new UIManager.UIBase("lblSpiritStatus",200,185,200,25));
        lblSpiritStatus.InnerText("Nothing");
        lblSpiritStatus.AddStyle("font-size","24px");
        lblSpiritStatus.AddStyle("font-family","Arial");
        lblSpiritStatus.AddStyle("text-align","center");
        lblSpiritStatus.UpdateObject();
        lblSpiritStatus.CenterX(this.trainingPanel.centerX);
        lblSpiritStatus.Y(mySprite.y + 120);
        
        var lblSpiritHP = UIManager.createUIElement(new UIManager.UIPanel("lblSpiritHP",220,205,100,100,"#ef5350"));
        lblSpiritHP.InnerText("HP");
        this.AddCircleStyle(lblSpiritHP);
        lblSpiritHP.UpdateObject();
        lblSpiritHP.Alpha(0.75);

        lblSpiritHP.events.onMouseEnter.add(this.OnTrainButtonEnter,this);
        lblSpiritHP.events.onMouseLeave.add(this.OnTrainButtonExit,this);
        lblSpiritHP.events.onClick.add(this.OnTrainButtonClicked,this);

        var lblSpiritMP = UIManager.createUIElement(new UIManager.UIPanel("lblSpiritMP",540,205,100,100,"#1976d2"));
        lblSpiritMP.InnerText("MP");
        this.AddCircleStyle(lblSpiritMP);
        lblSpiritMP.Alpha(0.75);
        lblSpiritMP.UpdateObject();

        lblSpiritMP.events.onMouseEnter.add(this.OnTrainButtonEnter,this);
        lblSpiritMP.events.onMouseLeave.add(this.OnTrainButtonExit,this);
        lblSpiritMP.events.onClick.add(this.OnTrainButtonClicked,this);

        var lblSpiritAGI = UIManager.createUIElement(new UIManager.UIPanel("lblSpiritAGI",220,445,80,80,"#226666"));
        lblSpiritAGI.InnerText("AGI");
        this.AddCircleStyle(lblSpiritAGI);
        lblSpiritAGI.Alpha(0.75);
        lblSpiritAGI.UpdateObject();

        lblSpiritAGI.events.onMouseLeave.add(this.OnTrainButtonExit,this);
        lblSpiritAGI.events.onMouseEnter.add(this.OnTrainButtonEnter,this);
        lblSpiritAGI.events.onClick.add(this.OnTrainButtonClicked,this);

        var lblSpiritINT = UIManager.createUIElement(new UIManager.UIPanel("lblSpiritINT",555,445,80,80,"#832C65"));
        lblSpiritINT.InnerText("INT");
        this.AddCircleStyle(lblSpiritINT);
        lblSpiritINT.Alpha(0.75);
        lblSpiritINT.UpdateObject();

        lblSpiritINT.events.onMouseEnter.add(this.OnTrainButtonEnter,this);
        lblSpiritINT.events.onMouseLeave.add(this.OnTrainButtonExit,this);
        lblSpiritINT.events.onClick.add(this.OnTrainButtonClicked,this);

        var lblSpiritSTR = UIManager.createUIElement(new UIManager.UIPanel("lblSpiritSTR",200,500,80,80,"#AA6A39"));
        lblSpiritSTR.InnerText("STR");
        this.AddCircleStyle(lblSpiritSTR);
        lblSpiritSTR.Alpha(0.75);
        lblSpiritSTR.CenterX(this.trainingPanel.centerX);
        lblSpiritSTR.UpdateObject();

        lblSpiritSTR.events.onMouseEnter.add(this.OnTrainButtonEnter,this);
        lblSpiritSTR.events.onMouseLeave.add(this.OnTrainButtonExit,this);
        lblSpiritSTR.events.onClick.add(this.OnTrainButtonClicked,this);

    },
    OnTrainButtonClicked : function(sender) {
        sender.Alpha(1);
    },
    OnTrainButtonEnter : function(sender) {
        sender.Alpha(1);
    },
    OnTrainButtonExit : function(sender) {
        sender.Alpha(0.75);
    },
}

