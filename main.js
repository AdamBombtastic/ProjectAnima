//TODO set resolution to the max window bounds and create a game state to detect if the phone is sideways or not. 
const GAME_WIDTH = 1334;
const GAME_HEIGHT = 750;
var game = new Phaser.Game(1334, 750, Phaser.AUTO, 'myGame');
 
//var clientWidth = function () {  return Math.max(window.innerWidth, document.documentElement.clientWidth);};
//var clientHeight = function () {  return Math.max(window.innerHeight, document.documentElement.clientHeight);};

var clientWidth = function() {return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);}
var clientHeight = function() {return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)};
function setGameScale() {

    var w = clientWidth();
    var h = clientHeight();
   if (w == game.width && h == game.height) {
       return false;
   }

   var tempScaleX = w/1334;
   var tempScaleY = h/750;


   var nextWidth = w;
   var nextHeight = h;
   
   if (nextHeight > nextWidth) {
       nextWidth = h;
       nextHeight = w;
   }
    //game.scale.setGameSize(nextWidth,nextHeight);
    //game.world.scale.setTo(nextWidth/1334,nextHeight/750);
    console.log(game.world);
   /*game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setGameSize();*/
   
}

game.state.add("login",loginState);
game.state.add("mainMenu",menuState);
game.state.add("train",trainState);
game.state.add("battle",battleState);
game.state.start("login");
