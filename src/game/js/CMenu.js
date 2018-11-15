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
// import CMain from './CMain.js'
import {
    mainInstance,
    s_bMobile,
    s_oStage,
    // s_oSpriteLibrary,
    s_bFullscreen,
} from './CMain.js'
// import {
//     CANVAS_WIDTH,
//     CANVAS_HEIGHT,
//     ON_MOUSE_UP,
//     ENABLE_FULLSCREEN,
//     DISABLE_SOUND_MOBILE,
//     SHOW_CREDITS
// } from './settings.js'
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
        s_oStage.addChild(_oBg);

        var oSprite = CSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((settings.CANVAS_WIDTH/2),settings.CANVAS_HEIGHT -200,oSprite);
        _oButPlay.addEventListener(settings.ON_MOUSE_UP, this._onButPlayRelease, this);
    
        if (settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = CSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: settings.CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite, mainInstance().getAudioActive());
            _oAudioToggle.addEventListener(settings.ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        
        var oSprite = CSpriteLibrary.getSprite('but_info');
        if(settings.SHOW_CREDITS){
            _pStartPosCredits = {x:10 + oSprite.width/2,y:(oSprite.height / 2) + 10};
            _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSprite,s_oStage);
            _oButCredits.addEventListener(settings.ON_MOUSE_UP, this._onCredits, this);
            
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width + 10,y:_pStartPosCredits.y};
        }else{
            _pStartPosFullscreen = {x:10 + oSprite.width/2,y:(oSprite.height / 2) + 10};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(settings.ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = CSpriteLibrary.getSprite('but_fullscreen');
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,true);
            _oButFullscreen.addEventListener(settings.ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,settings.CANVAS_WIDTH,settings.CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function() {
        _oButPlay.unload(); 
        _oButPlay = null;
        _oFade.visible = false;
        
        if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        if(settings.SHOW_CREDITS){
            _oButCredits.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        // s_oMenu = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        
        if(settings.SHOW_CREDITS){
            _oButCredits.setPosition(_pStartPosCredits.x + iNewX,_pStartPosCredits.y + iNewY);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
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
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onFullscreenRelease = function(){
        if (s_bFullscreen) { 
		    _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }
	
	    sizeHandler();
    };
    
    this._onCredits = function(){
        // TODO (jiwoniy)
        var _oCreditsPanel = new CCreditsPanel();
    };
    // console.log(s_oMenu)
    // console.log(this)
    // s_oMenu = this;
    
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

export default Singleton.getInstance;