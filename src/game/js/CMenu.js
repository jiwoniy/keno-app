import $ from 'jquery'
import { Howler } from 'howler';

import createjs from './createjs.js'
import {
    s_iOffsetX,
    s_iOffsetY,
    createBitmap,
    sizeHandler
} from './ctl_utils.js'
import screenfull from './screenfull.js'

import CGfxButton from './CGfxButton.js'
import CToggle from './CToggle.js'
import CCreditsPanel from './CCreditsPanel.js'

import CSpriteLibrary from './sprite_lib'
import {
    mainInstance,
} from './CMain.js'
import settings from './settings.js'

function CMenu() {
    var _oBg;
    var _oButPlay;
    var _oFade;
    var _oAudioToggle;
    var _oButCredits;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pStartPosCredits;
    
    this.init = function() {
        _oBg = createBitmap(CSpriteLibrary.getSprite('bg_menu'));
        mainInstance().getStage().addChild(_oBg);

        const butPlaySprite = CSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((settings.CANVAS_WIDTH / 2), settings.CANVAS_HEIGHT -200, butPlaySprite);
        _oButPlay.addEventListener(settings.ON_MOUSE_UP, this._onButPlayRelease, this);
    
        if (settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false){
            const audioIconSprite = CSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: settings.CANVAS_WIDTH - (audioIconSprite.height / 2)- 10, y: (audioIconSprite.height / 2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, audioIconSprite, mainInstance().getAudioActive());
            _oAudioToggle.addEventListener(settings.ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        
        const butInfoSprite = CSpriteLibrary.getSprite('but_info');
        if(settings.SHOW_CREDITS) {
            _pStartPosCredits = {x:10 + butInfoSprite.width / 2,y:(butInfoSprite.height / 2) + 10};
            _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, butInfoSprite, mainInstance().getStage());
            _oButCredits.addEventListener(settings.ON_MOUSE_UP, this._onCredits, this);
            
            _pStartPosFullscreen = {x: _pStartPosCredits.x + butInfoSprite.width + 10, y: _pStartPosCredits.y};
        } else {
            _pStartPosFullscreen = {x: 10 + (butInfoSprite.width / 2),y: (butInfoSprite.height / 2) + 10};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(settings.ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled) {
            const butFullScreenSprite = CSpriteLibrary.getSprite('but_fullscreen');

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y, butFullScreenSprite, mainInstance().getAudioActive(), true);
            _oButFullscreen.addEventListener(settings.ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,settings.CANVAS_WIDTH,settings.CANVAS_HEIGHT);
        
        mainInstance().getStage().addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function() {
        _oButPlay.unload(); 
        _oButPlay = null;
        _oFade.visible = false;
        
        if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
        }
        
        if(settings.SHOW_CREDITS) {
            _oButCredits.unload();
        }
        
        mainInstance().getStage().removeChild(_oBg);
        _oBg = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY) {
        if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        
        if(settings.SHOW_CREDITS) {
            _oButCredits.setPosition(_pStartPosCredits.x + iNewX,_pStartPosCredits.y + iNewY);
        }
        
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
    };
    
    this._onAudioToggle = function() {
        Howler.mute(mainInstance().getAudioActive());
        mainInstance().setAudioActive(!mainInstance().getAudioActive())
    };
    
    this._onButPlayRelease = function() {
        this.unload();
        
        $(mainInstance()).trigger("start_session"); 
        mainInstance().gotoGame();
    };
    
    this.resetFullscreenBut = function() {
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setActive(mainInstance().getAudioActive());
        }
    };

    this._onFullscreenRelease = function(){
        if (mainInstance().getAudioActive()) { 
		    _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }
	
	    sizeHandler();
    };
    
    this._onCredits = function(){
        // TODO (jiwoniy)
        // var _oCreditsPanel = new CCreditsPanel();
        new CCreditsPanel();
    };
    
    this.init();
}

const Singleton = (() => {
    let instance = null;
  
    function createInstance() {
        return new CMenu();
    }
  
    return {
      getInstance(isConstructor) {
        if (isConstructor) {
            instance = createInstance();
        } else if (!isConstructor && !instance) {
            instance = createInstance();
        }
        // if (isConstructor && !instance) {
        //   instance = createInstance();
        // }
        return instance;
      },
    };
})();
const menuInstance = () => Singleton.getInstance(false)

export default Singleton.getInstance;
export {
    menuInstance
}