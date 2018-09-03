/** 
 * mainMenu.js
 * Date:4/6/2016
 * Programmer: Adam Austin
 * 
 * 
 * 
*/
var GRID_DIRECTIONS = {
    UP : 0,
    DOWN : 1,
    LEFT : 2,
    RIGHT : 3
}
var battleState = {
    started : false,
    bullets : [],
    sceneData : null,
    canMove : true,
    canFire : true,
    NetworkUpdate: function(event,data) {
        console.log("World State Recieved: " + event + " " + data);
        if (event == "battleUpdate") {
            console.log(data);
            battleState.started = true;
            this.wDialog.kill();
            battleState.sceneData = data;
            battleState.renderScene();
        }   
        },
    ConfirmationDialogFinish: function(obj) {
        obj.kill();
        //this.ShowUI();
        
    },
    preload : function() {
        game.load.image("tile_basic","graphics\\testTile2.png");
        game.load.image("battler_basic","graphics\\testBattler.png");
        game.load.spritesheet("proj_basic","graphics\\erotic_balls.png",32,32,6);
    },
    init : function() {
        
        NetworkManager.addObserver(this);
        
        
    },
    getPlayersFromData : function() {
        var myPlayer = null;
        var otherPlayer = null;
        if (this.sceneData != null) {
            for (var i = 0; i < this.sceneData.players.length; i++) {
                var currentPlayer = this.sceneData.players[i];
                if (NetworkManager.socket.id == currentPlayer.key) {
                    myPlayer = currentPlayer;
                }
                else otherPlayer = currentPlayer;
            }
            return {me: myPlayer, enemy : otherPlayer}
        }
        return null;
    },
    renderScene : function () {
        
        if (this.gridTiles == null) {
            var start = {x: 200, y:200}
            var myTiles = {}
            myTiles.group = game.add.group();
            for (var i = 0; i < 6; i++) {
                myTiles[i] = [];
                for (var j = 0; j < 3; j++) {
                    myTiles[i].push(game.add.sprite(start.x+(i*128),start.y+(j*104),"tile_basic"));
                    if (i >= 3) tintSprite(myTiles[i][j],0xFF2222);
                    myTiles.group.add(myTiles[i][j]);
                }
            }
            this.gridTiles = myTiles;
         }
        var players = this.getPlayersFromData();
        var myPlayer = players.me;
        var enemyPlayer = players.enemy;


        //myTiles.group.centerX = game.world.centerX;
        if (this.myBattler == null) this.myBattler = game.add.sprite(0,0,"battler_basic");
        this.myBattler.myGridPos = {x : myPlayer.x, y : myPlayer.y}

        if (this.myEnemy == null) this.myEnemy = game.add.sprite(0,0, "battler_basic");
        this.myEnemy.myGridPos = {x : enemyPlayer.x, y: enemyPlayer.y}

        this.renderPlayer(this.myBattler,this.myBattler.myGridPos.x,this.myBattler.myGridPos.y);
        this.renderPlayer(this.myEnemy,this.myEnemy.myGridPos.x,this.myEnemy.myGridPos.y);

        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.bullets = [];
    },
    create : function() {
        UIManager.ClearUI();
        game.stage.backgroundColor=0x72707A;
        
        //NetworkManager.GetSpiritInfo();
        ;
        this.ShowUI();

        this.wDialog = new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Waiting for opponent. . . ",true);
        this.wDialog.delegate = this;
        this.wDialog.Show();
        
        NetworkManager.RequestBattle();

        //TODO: Render the states that the server sends to me!
    },
    TryMove: function(dir) {
        NetworkManager.UpdateBattle({direction: dir});
    },
    moveInDirection : function(dir) {
        var x = this.myBattler.myGridPos.x;
        var y = this.myBattler.myGridPos.y;
        switch (dir) {
            case "up":
                y -= 1;
                break;
            case "down":
                y += 1;
                break;
            case "left":
                x-=1;
                break;
            case "right":
                x+=1;
                break;
            default:
        }
       this.renderPlayer(x,y);
    },
    renderPlayer : function(playerSprite,x,y,isPlayerOne=true) {
        var theTile = this.gridTiles[x][y];
        playerSprite.centerX = theTile.centerX;
        playerSprite.centerY = theTile.centerY-32;
        playerSprite.myGridPos = {x:x,y:y}
    },
    manageBullets : function(bulletSpeed=32) {
        var newBulletList = [];
        for (var i = 0; i < this.bullets.length;i ++) {
            this.bullets[i].x+=bulletSpeed;
            if (!this.bullets[i].inCamera) {
                this.bullets[i].kill();
            }
            else newBulletList.push(this.bullets[i]);
            //TODO: Check if they are off screen.
        }
        this.bullets = newBulletList;
    },
    update : function() {
        if (battleState.started) {
            this.manageBullets();
            var didPressKey = false;
            if (this.canMove) {
                if (this.cursors.up.isDown) {
                    this.TryMove(GRID_DIRECTIONS.UP);
                    //this.moveInDirection("up");
                    didPressKey = true;
                }
                else if (this.cursors.down.isDown) {
                    this.TryMove(GRID_DIRECTIONS.DOWN);
                    //this.moveInDirection("down");
                    didPressKey = true;
                }
                else if (this.cursors.left.isDown) {
                    this.TryMove(GRID_DIRECTIONS.LEFT);
                    //this.moveInDirection("left");
                    didPressKey = true;
                }
                else if (this.cursors.right.isDown) {
                    this.TryMove(GRID_DIRECTIONS.RIGHT);
                    //this.moveInDirection("right");
                    didPressKey = true;
                }
                if (didPressKey) {
                    battleState.canMove = false;
                    game.time.events.add(Phaser.Timer.SECOND / 8, () => {battleState.canMove = true},this);
                }
            }
            if (this.canFire) {
                if (this.spaceKey.isDown) {
                    battleState.canFire = false;
                    var myBall = game.add.sprite(this.myBattler.centerX+48,this.myBattler.centerY-32,"proj_basic",0);
                    myBall.centerY = this.myBattler.centerY;
                    battleState.bullets.push(myBall);
                    game.time.events.add(Phaser.Timer.SECOND /3, () => {battleState.canFire = true},this);
                }
            }
    }

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

