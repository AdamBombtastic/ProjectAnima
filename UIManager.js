//UIManager will contain a bunch of UI methods
var UIStyles = {
   bigFont : {font: "100px Arial", fill: "White"},
   largeFont : {font: "60px Arial", fill: "White"},
   medFont: {font: "40px Arial", fill: "White"},
   smallerFont: {font: "28px Arial", fill:"White"},
   smallFont: {font: "26px Arial", fill: "White"}
}
var UIManager = {
    game : null,
    idcount : 0,
    events : {}, //key, list of objects
    htmlObjects : [],
    RegisterEvent : function(eName) {
        if (this.events[eName] == null) {
            this.events[eName] = [];
        }
    },
    SubscribeToEvent : function(ename, obj) {
        this.RegisterEvent(ename);
        this.events[ename].push(obj);
    },
    BroadcastEvent : function(ename) {
        //console.log("Broadcasting event: " + ename);
        if (this.events[ename] == null) return;
        for (var i = 0; i < this.events[ename].length;i++) {
            var myObj = this.events[ename][i];
            myObj.UpdateEvent();
        }
    },
    createUIGraphics : function(x,y,width,height,background=0xFFFFFF,border=0x000000,backAlpha = 0.75,borderAlpha = 1,borderSize=2) {
        var tempGraphics = game.add.graphics(x,y);
        
        tempGraphics.beginFill(background,backAlpha);
        tempGraphics.drawRect(0,0,width,height);
        tempGraphics.endFill();

        tempGraphics.lineStyle(borderSize,border,borderAlpha);
        tempGraphics.drawRect(0,0,width,height);
        return tempGraphics;
    },
    createUIPanel : function(x,y,width,height,background=0xFFFFFF,border=0x000000,backAlpha = 0.75,borderAlpha = 1,borderSize=2) {
        var tempGraphics = this.createUIGraphics(x,y,width,height,background,border,backAlpha,borderAlpha,borderSize);

        var tempSprite = game.add.sprite(x,y,tempGraphics.generateTexture());
        tempGraphics.destroy();
        return tempSprite;
    },
    createConfirmationDialog : function(x,y,message,singleButton=false,background=0x784212,border=0xFFFFFF,backAlpha=0.95,borderAlpha=1) {
        
        var tempPanel = this.createUIPanel(x,y,300,150,background,border,backAlpha,borderAlpha);
        
        var tempText = game.add.text(x,y-30,message,{font: "28px Arial", fill: "White",wordWrap: true, wordWrapWidth: 400});

        var returnObj = {id: this.idcount,response:null,delegate:null}
        var confirmButton = game.add.sprite(x,y,"ui_icons_temp",0);
        confirmButton.inputEnabled = true;
        confirmButton.animations.add("go",[0]).play(1,true);
        confirmButton.events.onInputOver.add(function() {
            tintSprite(confirmButton,0x555555);
        },this);
        confirmButton.events.onInputOut.add(function() {
            tintSprite(confirmButton,0xFFFFFF);
        },this);
        confirmButton.events.onInputUp.add(function() {
            returnObj.response = true;
            returnObj.delegate.ConfirmationDialogFinish(returnObj);
        },this);

        var cancelButton = null;
        if (!singleButton) {
            cancelButton = game.add.sprite(x,y,"ui_icons_temp",1);
            cancelButton.animations.add("go",[1]).play(1,true);
            cancelButton.events.onInputOver.add(function() {
                tintSprite(cancelButton,0x555555);
            },this);
            cancelButton.events.onInputOut.add(function() {
                tintSprite(cancelButton,0xFFFFFF);
            },this);
            cancelButton.events.onInputUp.add(function() {
                returnObj.response = false;
                returnObj.delegate.ConfirmationDialogFinish(returnObj);
            },this);
            cancelButton.inputEnabled = true;
        }

        //confirmButton.scale.setTo(0.,0.75);
        //cancelButton.scale.setTo(0.75,0.75);

        tempPanel.centerX = x;
        tempPanel.centerY = y;

        tempText.centerX = x;
        tempText.centerY = y-50;

        confirmButton.centerX = x-100;
        confirmButton.centerY = y+50;

        
        if (!singleButton) {
        cancelButton.centerX = x+100;
        cancelButton.centerY = y+50;
        }
        else {
            confirmButton.centerX = x;
        }

        returnObj.group = game.add.group();
        returnObj.sprite = tempPanel;
        returnObj.text = tempText;
        returnObj.cancel = cancelButton;
        returnObj.ok = confirmButton;

        returnObj.group.add(tempPanel);
        returnObj.group.add(tempText);
        if (!singleButton) {
            returnObj.group.add(cancelButton);
        }
        returnObj.group.add(confirmButton);

        returnObj.group.scale.setTo(1.5,1.5);
        returnObj.group.centerX = x;
        returnObj.group.centerY = y;

        returnObj.kill = function() {
            returnObj.group.kill();
            
            returnObj = null;
        }

        this.idcount += 1;
        return returnObj;
    },
    ClearUI : function() {
        for (var i =0; i < this.htmlObjects.length;i++) {
            var myObj = document.getElementById(this.htmlObjects[i]);
            if (myObj != null) myObj.remove();
        }
    },
    UIBase : function(id,x,y,width,height) {
        /** TODO: Add Color stuff */
        UIManager.htmlObjects.push(id);
        this.id = id;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._eventMap = {
            onClick : [],
        }

        this._domObject = null;
        this._class = "div";

        this.GetStyleString = function() {
            var styleString = "position: absolute; z-index:1000; ";
                styleString +="top: "+this._y+"px; left: " + this._x +"px; ";
                styleString += "width: "+this._width+"px; height: "+this._height+"px; ";
                styleString += "right: 0; bottom: 0;";
                
                if (this._domObject != null) {
                    this._domObject.style = styleString;
                }
                return styleString;
        }
        this.RefreshSelector = function() {
            this._domObject = document.getElementById(this.id);
        }
        this.UpdateObject = function() {
            /** Override this for different implementations **/
            this.Style(this.GetStyleString());
            if (me.DomObject() != null) me.DomObject().onclick = () => {
                me._onClick();
            };
        }
        this.Kill = function() {
            this.RefreshSelector();
            if (this._domObject != null)this._domObject.remove();
        }
        this.kill = function() {
            this.Kill();
        }
        this.GenHTML = function() {
            return "<"+this._class +" id='"+this.id+"'> </"+this._class+">"; 
        }
        //region "Properties"
        this.X = (x=null) => {
            if (x != null) {
                this._x = x;
            }
            this.UpdateObject();
            return this._x;
        }
        this.Y = (y=null) => {
            if (y != null) {
                this._y = y;
            }
            this.UpdateObject();
            return this._y;
        }
        this.Width = (width=null) => {
            if (width != null) {
                this._width = width;
            }
            this.UpdateObject();
            return this._width;
        }
        this.Height = (height=null) => {
            if (height != null) {
                this._height = height;
            }
            this.UpdateObject();
            return this._height;
        }
        this.Style = (style = null) => {
            if (this._domObject != null) {
                this._domObject = document.getElementById(this.id);
                if (style != null) {
                    this._domObject.style=style;
                }
                return this._domObject.style;
            }
            return null;
        }
        this.Value = (value = null) => {
            if (this._domObject != null) {
                this._domObject = document.getElementById(this.id);
                if (value != null) this._domObject.value = value;
                return this._domObject.value;
            }
            return null;
        }
        this.InnerText = (innerText=null) => {
            if (this._domObject != null) {
                this._domObject = document.getElementById(this.id);
                if (innerText != null) this._domObject.innerText = innerText;
                return this._domObject.innerText;
            }
            return null;
        }
        this.DomObject = function() { 
            if (this._domObject != null) this.RefreshSelector();
            return this._domObject;
        }
        this.LocalCenterX = function() {
            return this.Width()/2;
        }
        this.CenterX = function(x=null) {
            if (x != null) {
                this.X(x-(this.Width()/2));
            }
            return this.X()+(this.Width()/2);
        }
        this.LocalCenterY = function() {
            return this.Height()/2;
        }
        this.CenterY = function(y=null) {
            if (t != null) {
                this.Y(y-(this.Height()/2));
            }
            return this.Y()+(this.Height()/2)
        }
        
        //TODO: Add events like Phaser objects
        let me = this;
        this.events = {
            onClick : {
                add : function(func,context) {
                    me._eventMap.onClick.push({func:func,context:context});
                    me.DomObject().onclick = () => {
                        me._onClick();
                    };
                },
                clear : function() {
                    me._eventMap.onClick = [];
                }
            }
        }
        this._onClick = function() {
            for (var i = 0; i < this._eventMap.onClick.length;i++) {
                var funcInfo = this._eventMap.onClick[i];
                var myFunc = funcInfo.func.bind(funcInfo.context);
                myFunc.call(funcInfo.context,null);
            }
        }

        //endregion    

    },
    UILabel : function (id,x,y,width,height,text,fontSize,fontColor) {
        UIManager.UIBase.call(this,id,x,y,width,height);
        
    },
    UIEntry : function(id,x,y,width,height,isPassword) {
        UIManager.UIBase.call(this,id,x,y,width,height);
        this._class = "input";

        this.GenHTML = function() {
            var myType = (isPassword) ? 'password' : 'text';
            return "<"+this._class +" id='"+this.id+"'" +"type='"+myType+"'"+"> </"+this._class+">"; 
        }
        this.Text = function(text=null) {
            if (this._domObject != null) {
                this._domObject = document.getElementById(this.id);
                if (text != null) this._domObject.value = text;
                return this._domObject.value;
            }
            return null;
        }
    },
    UIButton : function(id,x,y,width,height,text) {
        UIManager.UIBase.call(this,id,x,y,width,height);
        this._class = "button";

        this.GenHTML=()=>{
            return "<button id='"+this.id+"'>"+text+"</button>";
        }
        this.Text=function(text=null) {
            if (this._domObject != null) {
                this._domObject = document.getElementById(this.id);
                if (text != null) this._domObject.InnerText = text;
                return this._domObject.innerText;
            }
            return null;
        } 
    },
    UIPanel : function(id,x,y,width,height,backgroundColor="Gray", textColor="White", borderColor="Black", borderWidth="2px") {
        UIManager.UIBase.call(this,id,x,y,width,height);
        this._children = [];
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._borderColor = borderColor;
        this.borderWidth = borderWidth;

        this.UpdateObject = function() {
            this.Style(this.GenExtraStyle());
            if (this.DomObject() != null) this.DomObject().onclick = () => {
                this._onClick();
            };

            for (var i = 0; i < this._children.length; i++) {
                this._children[i].RefreshSelector();
                this._children[i].UpdateObject();
            }
        }

        this.Add = function(obj) {
            if (this._children.indexOf(obj)==-1) {
                this._children.push(obj);
            }
        }
        this.AddAll = function(objs) {
            for (var i = 0; i < objs.length; i++) {
                this.Add(objs[i]);
            }
        }
        this.GenChildHTML = function() {
            var html = "";
            for (var i = 0; i < this._children.length; i++) {
                html+=this._children[i].GenHTML();
            }
            return html;
        }
        this.GenHTML= function() {
            return "<"+this._class +" id='"+this.id+"'>"+this.GenChildHTML()+" </"+this._class+">"; 
        }
        this.GenExtraStyle=function() {
            var styleString = this.GetStyleString();
            styleString += "background-color: "+this._backgroundColor+"; color:"+textColor+"; ";
            styleString += "border-color: "+this._borderColor +"; border-width" + this.borderWidth + "; ";
            styleString += "border-style: solid;";
            return styleString;
        }
        this.Kill = () => {
            this.RefreshSelector();
            if (this._domObject != null)this._domObject.remove();

            for (var i = 0; i < this._children.length; i++) {
                this._children[i].Kill();
            }
        }
    },
    UIDialog : function(id,x,y,text,isOnebutton=true,width=500,height=350,backgroundColor="Gray", textColor="White", borderColor="Black", borderWidth="2px") {
        UIManager.UIPanel.call(this,id,x,y,width,height,backgroundColor,textColor,borderColor,borderWidth);
        this.delegate = null;
        this.response = null;
        this._label = new UIManager.UIBase(id+"-label",this.LocalCenterX(),20,150,100);
        if (isOnebutton) {
            this._yesButton = new UIManager.UIButton(id+"-posbtn",this._label.X(), this.Height()-50,20,20,"Ok");
            this.AddAll([this._label,this._yesButton]);
        }
        else {
            this._yesButton = new UIManager.UIButton(id+"-posbtn",this._label.X()-100, this.Height()-50,20,20,"Ok");
            this._noButton = new UIManager.UIButton(id+"-negbtn",this._label.X()+100, this.Height()-50,20,20,"Cancel");
            this.AddAll([this._label,this._yesButton,this._noButton]);
        }
        let me = this;
        this.Show = function() {
            if (this.DomObject() == null) {
                me = UIManager.createUIElement(me);
                me._label.InnerText(text);
                me._yesButton.events.onClick.add(function() {
                    me.response = true;
                    if (me.delegate != null) {
                        me.delegate.ConfirmationDialogFinish(me);
                    }
                },this);
                if (!isOnebutton) {
                    me._noButton.events.onClick.add(function() {
                        me.response = false;
                        if (me.delegate != null) {
                            me.delegate.ConfirmationDialogFinish(me);
                        }
                    },this);
                }
            }
            return me;
        }
    },
    createUIElement : function (uibase) {
        var canvasElement = document.getElementById("uiMan");        
        canvasElement.innerHTML += uibase.GenHTML();
        uibase._domObject = document.getElementById(uibase.id);
        uibase.UpdateObject();
        return uibase;
    },
    createTextEntry : function(id,x,y,width,height,isPassword) {
        //TODO: Make a wrapper class to instantiate these;
        var canvasElement = document.getElementById("uiMan");        
        canvasElement.innerHTML += "<div><input type='text' id='"+id+"' /></div>";
        var myInput = document.getElementById(id);
        myInput.style = "z-index:1000;position:absolute; top:"+x+"px; left:"+y+"px; right: 0; bottom:0; width:"+width+"px; height:" + height +"px;";
        return myInput;
    }
}
function tintSprite(s,c) {
    if (s != null)
        s.tint = c;
}
function addHoverEffect(s,c=0x555555) {
    s.inputEnabled = true;
    s.events.onInputOver.add(function() {
        tintSprite(s,c);
    },this);
    s.events.onInputOut.add(function() {
        tintSprite(s,0xFFFFFF);
    },this);
    s.events.onInputDown.add(function() {
        tintSprite(s,c);
    },this);
    s.events.onInputUp.add(function() {
        tintSprite(s,0xFFFFFF);
    },this);
}
/***
 * Navigation manager
 */

 var NavigationManager = {
    stack: [],
    CurrentState : function() {
        if (this.stack.length > 0) {
            return this.stack[this.stack.length-1];
        }
        return null;
    },
    pushState: function(sname,bundle,isAnimated=false) { //New State
        this.stack.push({name:sname,bundle:bundle});
        if (isAnimated) {
            game.camera.onFadeComplete.removeAll();
            game.camera.onFadeComplete.add( function() {game.state.start(sname,true,false,bundle);},this);
            game.camera.fade();
        }
        else game.state.start(sname,true,false,bundle);

        UIManager.events = {};
    },
    popState: function(isAnimated=false) { // BackButton
        if (this.stack.length > 1) {
            this.stack.pop();
            var cState =  this.CurrentState();
            if (isAnimated) {
                game.camera.onFadeComplete.removeAll();
                game.camera.onFadeComplete.add( function() {game.state.start(cState.name,true,false,cState.bundle);},this);
                game.camera.fade();
            }
            else game.state.start(cState.name,true,false,cState.bundle);
            UIManager.events = {};
        }
    },
    ForceState: function(sname,bundle, isAnimated = false) {
        //Using this doesn't allow the player to go back
        this.stack.splice(0,this.stack.length);
        this.stack.push({name:sname,bundle:bundle});
        if (isAnimated) {
            game.camera.onFadeComplete.removeAll();
            game.camera.onFadeComplete.add( function() {game.state.start(sname,true,false,bundle);},this);
            game.camera.fade();
        }
        else game.state.start(sname,true,false,bundle);
        UIManager.events = {};
    }
 }