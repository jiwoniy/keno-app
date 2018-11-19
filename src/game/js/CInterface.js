import $ from 'jquery'
import { Howler } from 'howler';

import screenfull from './screenfull.js'
import {
    s_iOffsetX,
    s_iOffsetY,
    sizeHandler
} from './ctl_utils.js'
import CSpriteLibrary from './sprite_lib'

import {
    mainInstance,
} from './CMain.js'
import settings from './settings.js'
import {
    TEXT_MIN,
    TEXT_UNDO,
    TEXT_PLAY1,
    TEXT_PLAY5,
    TEXT_PLUS,
    TEXT_CLEAR,
    TEXT_CURRENCY,
} from './CLang.js'

// import {
//     gameInstance
// } from './CGame.js'
import CToggle from './CToggle.js'
import CGfxButton from './CGfxButton.js'
import CTextToggle from './CTextToggle.js'
import CDisplayPanel from './CDisplayPanel.js'

// TODO (jiwoniy)function ===> Class
function CInterface(gameInstance) {
    var _oAudioToggle;
    var _oButExit;
    var _oButMin;
    var _oButPlus;
    var _oMoneyDisplay;
    var _oBetDisplay;
    var _oButPlay1;
    var _oButPlay5;
    var _oButUndo;
    var _oButClear;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;

    this.gameInstance = gameInstance
    
    this.initInterface = function() {                
        let oExitX;        
        
        const closeSprite = CSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: settings.CANVAS_WIDTH - (closeSprite.height / 2)- 20, y: (closeSprite.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, closeSprite, true);
        _oButExit.addEventListener(settings.ON_MOUSE_UP, this._onExit, this);
        
        oExitX = settings.CANVAS_WIDTH - (closeSprite.width / 2) - 100;
        _pStartPosAudio = {x: oExitX-15, y: (closeSprite.height / 2) + 10};
        
        if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false) {
            const audioSprite = CSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y, audioSprite, mainInstance().getAudioActive());
            _oAudioToggle.addEventListener(settings.ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        
        const doc = window.document;
        const docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(settings.ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            const fullScreenSprite = CSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: fullScreenSprite.width / 4 + 10,y: fullScreenSprite.height / 2 + 10};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, fullScreenSprite, mainInstance().getFullscreen(), true);
            _oButFullscreen.addEventListener(settings.ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        const moneyPanelSprite = CSpriteLibrary.getSprite('money_panel');
        _oMoneyDisplay = new CDisplayPanel(370, settings.CANVAS_HEIGHT - 225, moneyPanelSprite,TEXT_CURRENCY + settings.getPlayerMoney(), settings.PRIMARY_FONT, "#ffffff", 40);

        const plusDispalySprite = CSpriteLibrary.getSprite('plus_display');
        _oBetDisplay = new CDisplayPanel(480, settings.CANVAS_HEIGHT - 130, plusDispalySprite, '$1', settings.PRIMARY_FONT, '#ffffff', 40, false, mainInstance().getStage());
        _oBetDisplay.setTextPosition(51);

        const butPlusSprite = CSpriteLibrary.getSprite('but_plus');
        _oButPlus = new CTextToggle(638, settings.CANVAS_HEIGHT - 130, butPlusSprite, TEXT_PLUS, settings.PRIMARY_FONT, '#ffffff', 70, false, mainInstance().getStage());
        _oButPlus.enable();
        _oButPlus.setTextPosition(0,20);
        _oButPlus.addEventListener(settings.ON_MOUSE_UP, this._onButPlusRelease, this);

        // const butPlusSprite = CSpriteLibrary.getSprite('but_plus');
        _oButMin = new CTextToggle(320, settings.CANVAS_HEIGHT - 130, butPlusSprite, TEXT_MIN, settings.PRIMARY_FONT, '#ffffff', 70, false, mainInstance().getStage());
        _oButMin.enable();
        _oButMin.setTextPosition(0,20);
        _oButMin.setScaleX(-1);
        _oButMin.addEventListener(settings.ON_MOUSE_UP, this._onButMinRelease, this);

        const butGenericSprite = CSpriteLibrary.getSprite('but_generic');
        _oButPlay1 = new CTextToggle(820, settings.CANVAS_HEIGHT - 130, butGenericSprite, TEXT_PLAY1, settings.PRIMARY_FONT, '#ffffff',30, false, mainInstance().getStage());
        _oButPlay1.disable();
        _oButPlay1.setTextPosition(0,10);
        _oButPlay1.addEventListener(settings.ON_MOUSE_UP, this._onPlay1, this);
        
        // var oSprite = CSpriteLibrary.getSprite('but_generic');
        _oButPlay5 = new CTextToggle(1060, settings.CANVAS_HEIGHT - 130, butGenericSprite, TEXT_PLAY5, settings.PRIMARY_FONT, '#ffffff',30, false, mainInstance().getStage());
        _oButPlay5.disable();
        _oButPlay5.setTextPosition(0,10);
        _oButPlay5.addEventListener(settings.ON_MOUSE_UP, this._onPlay5, this);

        // var oSprite = CSpriteLibrary.getSprite('but_generic');
        _oButUndo = new CTextToggle(1300, settings.CANVAS_HEIGHT - 130, butGenericSprite, TEXT_UNDO,settings.PRIMARY_FONT, '#ffffff', 30, false, mainInstance().getStage());
        _oButUndo.enable();
        _oButUndo.setTextPosition(0,10);
        _oButUndo.addEventListener(settings.ON_MOUSE_UP, this._onUndo, this);
        
        // var oSprite = CSpriteLibrary.getSprite('but_generic');
        _oButClear = new CTextToggle(1540,
            settings.CANVAS_HEIGHT - 130,
            butGenericSprite,
            TEXT_CLEAR,
            settings.PRIMARY_FONT,
            '#ffffff',
            30,
            false,
            mainInstance().getStage());
        _oButClear.enable();
        _oButClear.setTextPosition(0,10);
        _oButClear.addEventListener(settings.ON_MOUSE_UP, this._onClear, this);
       
       this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function() {
        if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        _oButExit.unload();
        _oMoneyDisplay.unload();
        _oBetDisplay.unload();
        _oButMin.unload();
        _oButPlus.unload();
        _oButPlay1.unload();
        _oButPlay5.unload();
        _oButUndo.unload();
        _oButClear.unload();
        
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
        }
        
        // s_oInterface = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
    };

    this.refreshBet = function(betMony) {
        _oBetDisplay.setText(TEXT_CURRENCY + betMony);
    };

    this.refreshMoney = function(szValue) {
        _oMoneyDisplay.setText(TEXT_CURRENCY + szValue)
    };
    
    this.enablePlus = function(bVal) {
        if(bVal){
            _oButPlus.enable();
        }else {
            _oButPlus.disable();
        }        
    };
    
    this.enableMin = function(bVal) {
        if(bVal){
            _oButMin.enable();
        }else {
            _oButMin.disable();
        } 
    };

    this.enablePlay1 = function(bVal) {
        if(bVal){
            _oButPlay1.enable();
        }else {
            _oButPlay1.disable();
        }        
    };

    this.enablePlay5 = function(bVal) {
        if(bVal){
            _oButPlay5.enable();
        }else {
            _oButPlay5.disable();
        }
    };
    
    this.enableUndo = function(bVal) {
        if(bVal){
            _oButUndo.enable();
        }else {
            _oButUndo.disable();
        }
    };

    this.enableClear = function(bVal) {
        if(bVal){
            _oButClear.enable();
        }else {
            _oButClear.disable();
        }
    };

    this.enableAllButton = function(bVal) {
        this.enablePlus(bVal);
        this.enableMin(bVal);
        this.enablePlay1(bVal);
        this.enablePlay5(bVal);
        this.enableUndo(bVal);
        this.enableClear(bVal);
        
    };

    this._onClear = function() {
        gameInstance.clearSelection();
    };
    
    this._onUndo = function() {
        gameInstance.undoSelection();
    };
    
    this._onButPlusRelease = function() {
        gameInstance.selectBet("add");
    };
    
    this._onButMinRelease = function() {
        gameInstance.selectBet("remove");
    };
    
    this._onPlay1 = function() {
        gameInstance.play();
    };
    
    this._onPlay5 = function() {
        gameInstance.play5();
    };
    
    this._onAudioToggle = function() {
        Howler.mute(mainInstance().getAudioActive());
        mainInstance().setAudioActive(!mainInstance().getAudioActive())
    };
    
    this.resetFullscreenBut = function() {
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setActive(mainInstance().getFullscreen());
        }
    };
    
    this._onFullscreenRelease = function() {
        if(mainInstance().getFullscreen()) {
		    _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }
        
	    sizeHandler();
    };
    
    this._onExit = function() {
        $(mainInstance()).trigger("end_session");
        
        const iCurPlayerMoney = gameInstance.getCurMoney();
        $(mainInstance()).trigger("share_event",iCurPlayerMoney);
        
        gameInstance.onExit();  
    };
    
    // s_oInterface = this;
    
    this.initInterface();
}

const Singleton = (() => {
    let instance = null;
    function createInstance(gameInstance) {
        return new CInterface(gameInstance);
    }
  
    return {
      getInstance: (isConstructor = false, gameInstance) => {
          // flag === true ===> constructor
        if (isConstructor) {
          instance = createInstance(gameInstance);
        } else if (isConstructor && !instance) {
            instance = createInstance(gameInstance);
        }
        return instance;
      },
    };
})();
const interfaceInstance = () => Singleton.getInstance(false)

export default Singleton.getInstance;
export {
    interfaceInstance
}