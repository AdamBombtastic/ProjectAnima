/** 
 * mainMenu.js
 * Date:4/6/2016
 * Programmer: Adam Austin
 * 
 * TODO: Refactor this whole damn view.
 * 
*/
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
        game.load.spritesheet("battler_basic","graphics\\testBattler.png",128,128,2);
        game.load.spritesheet("proj_basic","graphics\\erotic_balls.png",32,32,6);
        game.load.spritesheet("basic_blast","graphics\\basic_blast2.png",128,128,6);
        game.load.spritesheet("basic_explosion","graphics\\basic_explosion2.png",64,64,5);
    },
    init : function() {
        
        NetworkManager.addObserver(this);
        
        
    },
    createExplosion: function(playerObj) {
        var myExplosion = game.add.sprite(0,0,"basic_explosion",0);
        myExplosion.centerX = playerObj.centerX;
        myExplosion.centerY = playerObj.centerY;
        var animPlay = myExplosion.animations.add("play");
        animPlay.play(12,false,true);
    },
    createBlast: function(playerObj) {
        var myExplosion = game.add.sprite(0,0,"basic_blast",0);
        myExplosion.centerX = playerObj.centerX;
        myExplosion.centerY = playerObj.centerY;
        var animPlay = myExplosion.animations.add("play");
        animPlay.play(24,false,true);
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

         var isLeft = myPlayer.x < 3;
        //myTiles.group.centerX = game.world.centerX;
        var textStyle = {font: "32px Arial", fill: "#FFFFFF"}
        if (this.myBattler == null) {
            this.myBattler = game.add.sprite(0,0,"battler_basic",(isLeft) ? 0 : 1);
            this.myBattlerText = game.add.text(0,0,myPlayer.health,textStyle);
        }
        this.myBattler.myGridPos = {x : myPlayer.x, y : myPlayer.y}

        if (this.myEnemy == null) {
            this.myEnemy = game.add.sprite(0,0, "battler_basic",(isLeft) ? 1 : 0);
            this.myEnemyText = game.add.text(0,0,enemyPlayer.health,textStyle);
        }
        this.myEnemy.myGridPos = {x : enemyPlayer.x, y: enemyPlayer.y}

        this.renderPlayer(this.myBattler,this.myBattler.myGridPos.x,this.myBattler.myGridPos.y,this.myBattlerText,myPlayer);
        this.renderPlayer(this.myEnemy,this.myEnemy.myGridPos.x,this.myEnemy.myGridPos.y,this.myEnemyText,enemyPlayer);

        this.renderObjects();

        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.bullets = [];
    },
    create : function() {
        UIManager.ClearUI();
        game.stage.backgroundColor=0x72707A;
        game.stage.disableVisibilityChange = true;
        //NetworkManager.GetSpiritInfo();
        ;
        this.ShowUI();

        this.wDialog = new UIManager.UIDialog("myDiag",game.world.centerX,game.world.centerY,"Waiting for opponent. . . ",true);
        this.wDialog.delegate = this;
        this.wDialog.Show();
        
        NetworkManager.RequestBattle();
    },
    TryMove: function(dir) {
        NetworkManager.UpdateBattle({type: BATTLE_REQUEST.MOVE,direction: dir});
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
    renderObjects : function() {
        if (this.sceneData != null && this.sceneData.objects != null) {
            for (var i = 0; i < this.sceneData.objects.length; i++) {
                var myObject = this.sceneData.objects[i];
                if (myObject.type == EFFECT_TYPES.BLAST) {
                    if (this.myBattler.myGridPos.x == myObject.x && this.myBattler.myGridPos.y == myObject.y) {
                        this.createBlast(this.myBattler);
                    }
                    else this.createBlast(this.myEnemy);
                }
                else if (myObject.type == EFFECT_TYPES.EXPLOSTION) {
                    if (this.myBattler.myGridPos.x == myObject.x && this.myBattler.myGridPos.y == myObject.y) {
                        this.createExplosion(this.myBattler);
                    }
                    else this.createExplosion(this.myEnemy);
                }
            }
        }
    },
    renderPlayer : function(playerSprite,x,y,playerText,playerInfo) {
        var theTile = this.gridTiles[x][y];
        playerSprite.centerX = theTile.centerX;
        playerSprite.centerY = theTile.centerY-32;
        playerSprite.myGridPos = {x:x,y:y}
        playerText.centerX = playerSprite.centerX;
        playerText.centerY = playerSprite.y-16;
        playerText.text = playerInfo.health;
    },
    manageBullets : function(bulletSpeed=32) {
        var newBulletList = [];
        for (var i = 0; i < this.bullets.length;i ++) {
            this.bullets[i].x+=bulletSpeed;
            if (!this.bullets[i].inCamera) {
                this.bullets[i].kill();
            }
            else newBulletList.push(this.bullets[i]);
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
                    //this.createBlast(this.myBattler);
                    //this.createExplosion(this.myEnemy);
                    NetworkManager.UpdateBattle({type:BATTLE_REQUEST.ATTACK});
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

