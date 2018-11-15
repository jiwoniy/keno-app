import $ from 'jquery'
import { Howl, Howler } from 'howler';

import './detectBrowser.js'
import createjs from './createjs.js'
import CSpriteLibrary from './sprite_lib.js'
import CPreloader from './CPreloader.js'

import { playSound } from './ctl_utils.js'
import settings from './settings.js'
import CMenu from './CMenu.js'
import CGame from './CGame.js'

function CMain (oData) {
    var _bUpdate;
    let soundsLoadedCnt = 0;
    let imagesLoadedCnt = 0;
    var _iState = settings.STATE_LOADING;
    // var _oData;
    
    var _oPreloader;
    // var _oMenu;
    // var _oHelp;
    // var _oGame;

    // state
    this.state = {
        initData: oData || {},
        loadResources: 0,
        audioActive: true,
        fullScreen: false,
        menu: null,
        game: null
    }

    this.s_iCurFps = 0

    // variables that can not be accurately grasp
        
    // _oData = oData;

    this.init = function() {
        s_oCanvas = document.getElementById('canvas');
        s_oStage = new createjs.Stage(s_oCanvas);
        createjs.Touch.enable(s_oStage);

        s_bMobile = $.browser.mobile;
        if(s_bMobile === false) {
            s_oStage.enableMouseOver(20);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this.ticker);
        createjs.Ticker.framerate = 30;
        
        if(navigator.userAgent.match(/Windows Phone/i)){
            settings.DISABLE_SOUND_MOBILE = true;
        }
        
        // _spriteLibrary  = CSpriteLibrary;
        
        //ADD PRELOADER
        _oPreloader = new CPreloader({ mainInstance: this });
    };
    
    this.preloaderReady = function() {
        if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this.loadSounds();
        }
        
        this.loadImages();
        _bUpdate = true;
    };
    
    this._onRemovePreloader = function(){
        _oPreloader.unload();
        playSound('soundtrack', 1, true);
        // s_oSoundTrack = playSound('soundtrack', 1, true);
        
        this.gotoMenu();
    };
    
    this.loadSounds = function() {
        var aSoundsInfo = [];
        aSoundsInfo.push({
            path: './sounds/',filename:'launch_ball',loop:false,volume:1, ingamename: 'launch_ball'
        });
        aSoundsInfo.push({
            path: './sounds/',filename:'win',loop:false,volume:1, ingamename: 'win'
        });
        aSoundsInfo.push({
            path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'
        });
        aSoundsInfo.push({
            path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'
        });
        aSoundsInfo.push({
            path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'
        });
        
        this.state.loadResources += aSoundsInfo.length;
        s_aSounds = [];

        for(let i = 0; i < aSoundsInfo.length; i += 1) {
            s_aSounds[aSoundsInfo[i].ingamename] = new Howl({ 
                src: [aSoundsInfo[i].path+aSoundsInfo[i].filename+'.mp3', aSoundsInfo[i].path+aSoundsInfo[i].filename+'.ogg'],
                autoplay: false,
                preload: true,
                loop: aSoundsInfo[i].loop, 
                volume: aSoundsInfo[i].volume,
                onload: mainInstance().soundLoaded
            });
        }
    };  

    this.loadImages = function() {
        CSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );
        CSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
        CSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
        
        CSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");         
        CSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg");
        
        CSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
        CSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
        CSpriteLibrary.addSprite("but_plus", "./sprites/but_plus.png");
        CSpriteLibrary.addSprite("but_generic", "./sprites/but_generic.png");
        CSpriteLibrary.addSprite("plus_display", "./sprites/plus_display.png");
        
        CSpriteLibrary.addSprite("num_button", "./sprites/num_button.png");
        CSpriteLibrary.addSprite("money_panel", "./sprites/money_panel.png");
        CSpriteLibrary.addSprite("payouts", "./sprites/payouts.png");
        CSpriteLibrary.addSprite("win_panel", "./sprites/win_panel.png");
        
        CSpriteLibrary.addSprite("hole", "./sprites/hole.png");
        CSpriteLibrary.addSprite("tube", "./sprites/tube.png");
        CSpriteLibrary.addSprite("ball", "./sprites/ball.png");
        
        CSpriteLibrary.addSprite("number", "./sprites/number.png");
        CSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");
        CSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
        CSpriteLibrary.addSprite("ctl_logo", "./sprites/ctl_logo.png");
        
        this.state.loadResources += CSpriteLibrary.getNumSprites();
        CSpriteLibrary.loadSprites();
    };

    this.soundLoaded = function() {
        soundsLoadedCnt += 1;
        _oPreloader.refreshLoader({ sounds: soundsLoadedCnt, images: imagesLoadedCnt });
    };
    
    this._onImagesLoaded = function() {
        imagesLoadedCnt += 1;
        _oPreloader.refreshLoader({ sounds: soundsLoadedCnt, images: imagesLoadedCnt });
    };
    
    this._onAllImagesLoaded = function(){
    };

    this.gotoMenu = function() {
        this.state.menu = CMenu(true);
        _iState = settings.STATE_MENU;
    };

    this.gotoGame = function() {
        this.state.game = new CGame(true, this.state.initData);   						
        _iState = settings.STATE_GAME;

        $(mainInstance()).trigger("game_start");
    };

    this.getAudioActive = function () {
        return this.state.audioActive
    }

    this.setAudioActive = function (value) {
        this.state.audioActive = value
    }

    this.getFullscreen = function () {
        return this.state.fullScreen
    }

    this.setFullScreen = function (value) {
        this.state.fullScreen = value
    }
    
    // this.gotoHelp = function(){
    //     _oHelp = new CHelp();
    //     _iState = STATE_HELP;
    // };
	
    this.stopUpdate = function() {
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function() {
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(this.state.audioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this.ticker = (event) => {
        if(_bUpdate === false) {
             return;
        }
        const iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            this.s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === settings.STATE_GAME) {
            this.state.game.update();
        }
        
        s_oStage.update(event);

    };
    // s_oMain = this;

    // TODO(jiwoniy)
    // ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    // ENABLE_FULLSCREEN = oData.fullscreen;
    // SHOW_CREDITS = oData.show_credits;
    
    this.init();
}

var s_bMobile;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
// var s_iCurFps = 0;

// var s_oDrawLayer;
var s_oStage;
// var s_oMain;
// var s_oSpriteLibrary;
// var s_oSoundTrack = null;
var s_oCanvas;
var s_aSounds;

// var s_bFullscreen = false;

const Singleton = (() => {
    let instance = null;
  
    function createInstance(data) {
        return new CMain(data);
    }
  
    return {
      getInstance(isConstructor, data) {
        if (isConstructor && !instance) {
          instance = createInstance(data);
        }
        return instance;
      },
    };
})();

const mainInstance = () => Singleton.getInstance(false)
export default Singleton.getInstance;
export {
    mainInstance,
    s_oStage,
    s_bMobile,
    // s_oMain,
    s_aSounds,
    // s_oSpriteLibrary,
    // s_bFullscreen,
} 
