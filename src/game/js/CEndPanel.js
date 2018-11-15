import $ from 'jquery'

import createjs from './createjs.js'
import {
    mainInstance,
} from './CMain.js'
import {
    gameInstance,
} from './CGame.js'
import {
    createBitmap,
    playSound
} from './ctl_utils.js'
import settings from './settings.js'
import {
    TEXT_GAMEOVER,
} from './CLang.js'

function CEndPanel(oSpriteBg){
    // var _oBg;
    var _oGroup;
    
    // var _oMsgTextBack;
    // var _oMsgText;
    var _oListener;

    this.state = {
        msgText: null,
        msgTextBack: null
    }
    
    this.initEndPanel = function(oSpriteBg) {
        
        const bg = createBitmap(oSpriteBg);
        bg.x = 0;
        bg.y = 0;
        
        this.state.msgTextBack = new createjs.Text("","60px "+settings.PRIMARY_FONT, '#000');
        this.state.msgTextBack.x = settings.CANVAS_WIDTH/2 +2;
        this.state.msgTextBack.y = (settings.CANVAS_HEIGHT/2)-48;
        this.state.msgTextBack.textAlign = "center";
        this.state.msgTextBack.textBaseline = "middle";
        this.state.msgTextBack.lineWidth = 500;

        this.state.msgText = new createjs.Text("", "60px "+settings.PRIMARY_FONT, '#ffffff');
        this.state.msgText.x = settings.CANVAS_WIDTH/2;
        this.state.msgText.y = (settings.CANVAS_HEIGHT/2) - 50;
        this.state.msgText.textAlign = 'center';
        this.state.msgText.textBaseline = 'middle';
        this.state.msgText.lineWidth = 500;       

        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oGroup.addChild(bg, this.state.msgTextBack, this.state.msgText);

        mainInstance().getStage().addChild(_oGroup);
    };
    
    this.unload = () => {
        _oGroup.off('mousedown', _oListener);
    };
    
    this._initListener = () => {
        _oListener = _oGroup.on('mousedown', this._onExit);
    };
    
    this.show = () => {
	    playSound('game_over', 1, false);
        this.state.msgTextBack.text = TEXT_GAMEOVER;
        this.state.msgText.text = TEXT_GAMEOVER;
        
        _oGroup.visible = true;
        
        // var oParent = this;
        createjs.Tween
            .get(_oGroup)
            .to({alpha:1 }, 500)
            .call(() => {this._initListener();});
    };
    
    this._onExit = () => {
        _oGroup.off('mousedown', _oListener);
        mainInstance().getStage().removeChild(_oGroup);
        
        $(mainInstance).trigger('end_session');
        
        gameInstance().onExit();
    };
    
    this.initEndPanel(oSpriteBg);
}

export default CEndPanel;

