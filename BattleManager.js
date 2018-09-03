var BattleManager = {
    
   Battler : function() {
        this._name = "";
        this._playerId = null;
        this._team = null;
        this._sprite = null;
        this._anims = {};

        this._health = 0;
        this._maxHealth = 0;

        this._mana = 0;
        this._maxMana = 0;

        this._spells = [];
   },
   
}
 var SpellManager = {
    Spell : function() {
        this._name = "";

        this._range = 0;
        this._width = 0;
        this._speed = 0;
        this._damage = 0;

        this._effect = null;

        this.flags = {}; 
    },
 }
