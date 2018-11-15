import createjs from './createjs.js'
import {
    createBitmap
} from './ctl_utils.js'

import CTextButton from './CTextButton.js'
import CSpriteLibrary from './sprite_lib'
import {
    // s_oMain,
    s_oStage,
    // s_oSpriteLibrary
} from './CMain.js'

import settings from './settings.js'
// import {
//     CANVAS_WIDTH,
//     CANVAS_HEIGHT,
//     PRIMARY_FONT,
//     PRIMARY_FONT_COLOUR,
//     ON_MOUSE_UP,
// } from './settings.js'

import {
    TEXT_PRELOADER_CONTINUE,
} from './CLang.js'

function CPreloader ({ mainInstance }) {
    var _iMaskWidth;
    var _iMaskHeight;
    var _oLoadingText;
    var _oProgressBar;
    var _oMaskPreloader;
    var _oFade;
    var _oIcon;
    var _oIconMask;
    var _oButStart;
    var _oContainer;
    // let _spriteLibrary = spriteLibrary

    this._init = function () {
        CSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
        CSpriteLibrary.addSprite("200x200", "./sprites/200x200.jpg");
        CSpriteLibrary.addSprite("progress_bar", "./sprites/progress_bar.png");
        CSpriteLibrary.addSprite("but_start", "./sprites/but_start.png");
        CSpriteLibrary.loadSprites();

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
    };

    this.unload = function () {
        _oContainer.removeAllChildren();
        _oButStart.unload();
    };

    this._onImagesLoaded = function () {
    };

    this._onAllImagesLoaded = function () {
        this.attachSprites();
        mainInstance.preloaderReady();
    };

    this.attachSprites = function () {
        const oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT);
        _oContainer.addChild(oBg);

        const backgroundSprite = CSpriteLibrary.getSprite('200x200');
        _oIcon = createBitmap(backgroundSprite);
        _oIcon.regX = backgroundSprite.width * 0.5;
        _oIcon.regY = backgroundSprite.height * 0.5;
        _oIcon.x = settings.CANVAS_WIDTH / 2;
        _oIcon.y = (settings.CANVAS_HEIGHT / 2) - 180;
        _oContainer.addChild(_oIcon);

        _oIconMask = new createjs.Shape();
        _oIconMask.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(_oIcon.x - 100, _oIcon.y - 100, 200, 200, 10);
        _oContainer.addChild(_oIconMask);
        
        _oIcon.mask = _oIconMask;

        const progressBarSprite = CSpriteLibrary.getSprite('progress_bar');
        _oProgressBar = createBitmap(progressBarSprite);
        _oProgressBar.x = settings.CANVAS_WIDTH/2 - (progressBarSprite.width / 2);
        _oProgressBar.y = settings.CANVAS_HEIGHT/2 + 50;
        _oContainer.addChild(_oProgressBar);

        _iMaskWidth = progressBarSprite.width;
        _iMaskHeight = progressBarSprite.height;
        _oMaskPreloader = new createjs.Shape();
        _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, 1, _iMaskHeight);

        _oContainer.addChild(_oMaskPreloader);

        _oProgressBar.mask = _oMaskPreloader;

        _oLoadingText = new createjs.Text("", "30px " + settings.PRIMARY_FONT, settings.PRIMARY_FONT_COLOUR);
        _oLoadingText.x = settings.CANVAS_WIDTH/2;
        _oLoadingText.y = settings.CANVAS_HEIGHT/2 + 100;
        _oLoadingText.textBaseline = "alphabetic";
        _oLoadingText.textAlign = "center";
        _oContainer.addChild(_oLoadingText);
        
        const butStartSprite = CSpriteLibrary.getSprite('but_start');
        _oButStart = new CTextButton(settings.CANVAS_WIDTH / 2, settings.CANVAS_HEIGHT / 2, butStartSprite, TEXT_PRELOADER_CONTINUE, 'Arial', '#000', "bold "+ 50, _oContainer);        
        _oButStart.addEventListener(settings.ON_MOUSE_UP, this._onButStartRelease, this);
        _oButStart.setVisible(false);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT);
        _oContainer.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha: 0}, 500).call(function () {            
            createjs.Tween.removeTweens(_oFade);
            _oContainer.removeChild(_oFade);
        });        
    };

    this._onButStartRelease = function(){
        mainInstance._onRemovePreloader();
    };

    this.refreshLoader = function ({ sounds = 0, images = 0 }) {
        // from CMain sounds 5
        // from CMain images 20
        // from CPreloader images 3
        const iPerc = Math.floor((sounds + images) / 25 * 100);
        _oLoadingText.text = `${iPerc}%`;
        
        if (iPerc === 100) {
            _oButStart.setVisible(true);
            _oLoadingText.visible = false;
            _oProgressBar.visible = false;
        } else {
            _oMaskPreloader.graphics.clear();
            const iNewMaskWidth = Math.floor((iPerc * _iMaskWidth) / 100);
            _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, iNewMaskWidth, _iMaskHeight);
        }
    };

    this._init();
}

export default CPreloader;
