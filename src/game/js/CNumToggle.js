import createjs from './createjs.js'
import {
    createSprite,
    playSound,
    s_iScaleFactor
} from './ctl_utils.js'

import settings from './settings.js'

import CSpriteLibrary from './sprite_lib'
// import CMain from './CMain.js'
// import {
//     s_oSpriteLibrary
// } from './CMain.js'

function CNumToggle(iXPos,iYPos, iNum, oParentContainer){
    var _bActive;
    var _bBlock;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _oButton;
    var _oButtonBg;
    var _oExtracted;
    var _oListenerMouseDown;
    var _oListenerMouseUp;
    
    var _aParams = [];
    
    this._init = function(iXPos,iYPos, iNum, oParentContainer){
        
        _bBlock = false;
        
        _aCbCompleted = [];
        _aCbOwner = [];
        
        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.cursor = "pointer";
        oParentContainer.addChild(_oButton);
        
        const numSprite = CSpriteLibrary.getSprite('num_button');
        // var oData = {   
        //                 images: [numSprite],
        //                 framerate: 5,
        //                 // width, height & registration point of each sprite
        //                 frames: {width: numSprite.width/2, height: numSprite.height, regX: (numSprite.width/2)/2, regY: numSprite.height/2}, 
        //                 animations: {state_true:[0],state_false:[1]}
        //            };
                   
        const numSpriteSheet = new createjs.SpriteSheet({   
            images: [numSprite],
            framerate: 5,
            // width, height & registration point of each sprite
            frames: {width: numSprite.width/2, height: numSprite.height, regX: (numSprite.width/2)/2, regY: numSprite.height/2}, 
            animations: {state_true:[0],state_false:[1]}
       });
         
        _bActive = false;
        _oButtonBg = createSprite(numSpriteSheet, "state_"+_bActive,(numSprite.width / 2) / 2, numSprite.height / 2, numSprite.width / 2, numSprite.height);
        _oButtonBg.stop();
        
        const ballSprite = CSpriteLibrary.getSprite('ball');
        // var oData = {   
        //                 images: [ballSprite], 
        //                 // width, height & registration point of each sprite
        //                 frames: {width: ballSprite.width/settings.NUM_DIFFERENT_BALLS, height: ballSprite.height, regX:(ballSprite.width/settings.NUM_DIFFERENT_BALLS)/2, regY:ballSprite.height/2}, 
        //                 animations: {red:[0],green:[1],cyan:[0],violet:[1],blue:[1]}
        //            };
                   
        const BallSpriteSheet = new createjs.SpriteSheet({   
            images: [ballSprite], 
            // width, height & registration point of each sprite
            frames: {width: ballSprite.width/settings.NUM_DIFFERENT_BALLS, height: ballSprite.height, regX:(ballSprite.width/settings.NUM_DIFFERENT_BALLS)/2, regY:ballSprite.height/2}, 
            animations: {red:[0],green:[1],cyan:[0],violet:[1],blue:[1]}
       });
        
        _oExtracted = createSprite(BallSpriteSheet, "red",(ballSprite.width/settings.NUM_DIFFERENT_BALLS)/2,ballSprite.height/2,ballSprite.width/settings.NUM_DIFFERENT_BALLS,ballSprite.height);//new createBitmap(oSprite);
        _oExtracted.gotoAndStop(0);
        _oExtracted.visible = false;

        _oButton.addChild(_oButtonBg, _oExtracted);
        
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown", _oListenerMouseDown);
       _oButton.off("pressup" , _oListenerMouseUp);
	   
       oParentContainer.removeChild(_oButton);
    };
    
    this._initListener = function(){
       _oListenerMouseDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerMouseUp = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,aParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };
    
    this.setActive = function(bActive){
        _bActive = bActive;
        _oButtonBg.gotoAndStop("state_"+_bActive);
    };
    
    this.buttonRelease = function(){
        
        if(_bBlock){
            return;
        }
        
        
        playSound("click",1,false);
        
        _bActive = !_bActive;
        _oButtonBg.gotoAndStop("state_"+_bActive);

        if(_aCbCompleted[settings.ON_MOUSE_UP]){
            _aCbCompleted[settings.ON_MOUSE_UP].call(_aCbOwner[settings.ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bBlock){
            return;
        }

       if(_aCbCompleted[settings.ON_MOUSE_DOWN]){
           _aCbCompleted[settings.ON_MOUSE_DOWN].call(_aCbOwner[settings.ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.getGlobalPosition = function(){
        return {x: _oButton.localToGlobal(0,0).x/s_iScaleFactor, y: _oButton.localToGlobal(0,0).y/s_iScaleFactor};
    };
    
    this.block = function(bVal){
        _bBlock = bVal;
    };
    
    this.setExtracted = function(bVal, iColor){
        _oExtracted.visible = bVal;
        _oExtracted.gotoAndStop(iColor);
    };
    
    this.highlight = function(){        
        _oButtonBg.gotoAndPlay(0);        
    };
    
    this.stopHighlight = function(){        
        _oButtonBg.gotoAndStop(1);
    };
    
    this._init(iXPos,iYPos, iNum, oParentContainer);
}

export default CNumToggle;
