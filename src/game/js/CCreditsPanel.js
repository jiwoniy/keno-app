import createjs from './createjs.js'
import {
    createBitmap
} from './ctl_utils.js'
import CGfxButton from './CGfxButton.js'
import CSpriteLibrary from './sprite_lib'
import {
    mainInstance,
} from './CMain.js'

import settings from './settings.js'
import {
    TEXT_CREDITS_DEVELOPED
} from './CLang.js'

function CCreditsPanel(){
    
    var _oBg;
    var _oButLogo;
    var _oButExit;
    var _oMsgText;
    
    var _oHitArea;
    
    var _oLink;
    var _oListener;
    
    var _pStartPosExit;
    
    var _oContainer;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        mainInstance().getStage().addChild(_oContainer);
        
        _oBg = createBitmap(CSpriteLibrary.getSprite('msg_box'));
        _oContainer.addChild(_oBg);
        
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT);
        _oHitArea.alpha = 0.01;
        _oListener = _oHitArea.on("click", this._onLogoButRelease);
        _oContainer.addChild(_oHitArea);
                
        var oSprite = CSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: 1230 , y: 340};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(settings.ON_MOUSE_UP, this.unload, this);
       
        _oMsgText = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + settings.SECONDARY_FONT, "#fff");
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
	_oMsgText.x = settings.CANVAS_WIDTH/2;
        _oMsgText.y = settings.CANVAS_HEIGHT/2 - 54;
	_oContainer.addChild(_oMsgText);
		
        oSprite = CSpriteLibrary.getSprite('ctl_logo');
        _oButLogo = createBitmap(oSprite);
        _oButLogo.regX = oSprite.width/2;
        _oButLogo.regY = oSprite.height/2;
        _oButLogo.x = settings.CANVAS_WIDTH/2;
        _oButLogo.y = settings.CANVAS_HEIGHT/2;
        _oContainer.addChild(_oButLogo);
        
        _oLink = new createjs.Text("www.ecoblock.com", "36px " + settings.SECONDARY_FONT, "#fff");
        _oLink.textAlign = "center";
        _oLink.textBaseline = "alphabetic";
	_oLink.x = settings.CANVAS_WIDTH/2;
        _oLink.y = settings.CANVAS_HEIGHT/2 + 70;
        _oContainer.addChild(_oLink);
    };

    
    this.unload = function(){
        _oHitArea.off("click", _oListener);
        
        _oButExit.unload(); 
        _oButExit = null;

        mainInstance().getStage().removeChild(_oContainer);
    };
    
    this._onLogoButRelease = function(){
        window.open("http://www.ecoblock.com/index.php?&l=en","_blank");
    };
    
    this._init();
    
    
};

export default CCreditsPanel;



