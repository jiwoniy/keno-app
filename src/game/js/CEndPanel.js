import $ from 'jquery'
import createjs from './createjs.js'
import {
    mainInstance,
    // s_oMain,
    s_oStage,
} from './CMain.js'
import {
    gameInstance,
} from './CGame.js'
import {
    createBitmap,
    playSound
} from './ctl_utils.js'
// import {
//     PRIMARY_FONT,
//     CANVAS_WIDTH,
//     CANVAS_HEIGHT,
// } from './settings.js'
import settings from './settings.js'
import {
    TEXT_GAMEOVER,
} from './CLang.js'

function CEndPanel(oSpriteBg){
    
    var _oBg;
    var _oGroup;
    
    var _oMsgTextBack;
    var _oMsgText;
    var _oListener;
    
    this._init = function(oSpriteBg){
        
        _oBg = createBitmap(oSpriteBg);
        _oBg.x = 0;
        _oBg.y = 0;
        
	_oMsgTextBack = new createjs.Text("","60px "+settings.PRIMARY_FONT, "#000");
        _oMsgTextBack.x = settings.CANVAS_WIDTH/2 +2;
        _oMsgTextBack.y = (settings.CANVAS_HEIGHT/2)-48;
        _oMsgTextBack.textAlign = "center";
        _oMsgTextBack.textBaseline = "middle";
        _oMsgTextBack.lineWidth = 500;

        _oMsgText = new createjs.Text("","60px "+settings.PRIMARY_FONT, "#ffffff");
        _oMsgText.x = settings.CANVAS_WIDTH/2;
        _oMsgText.y = (settings.CANVAS_HEIGHT/2) - 50;
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "middle";
        _oMsgText.lineWidth = 500;       

        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oGroup.addChild(_oBg,_oMsgTextBack,_oMsgText);

        s_oStage.addChild(_oGroup);
    };
    
    this.unload = function(){
        _oGroup.off("mousedown",_oListener);
    };
    
    this._initListener = function(){
        _oListener = _oGroup.on("mousedown",this._onExit);
    };
    
    this.show = function(){
	playSound("game_over",1,false);
        
        
        _oMsgTextBack.text = TEXT_GAMEOVER;
        _oMsgText.text = TEXT_GAMEOVER;
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
    };
    
    this._onExit = function(){
        _oGroup.off("mousedown",_oListener);
        s_oStage.removeChild(_oGroup);
        
        $(mainInstance).trigger("end_session");
        
        gameInstance().onExit();
    };
    
    this._init(oSpriteBg);
    
    return this;
}

export default CEndPanel;

