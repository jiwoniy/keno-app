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
    
    // var _oBg;
    // var _oButLogo;
    // var _oButExit;
    // var _oMsgText;
    
    // var _oHitArea;
    
    // var _oLink;
    // var _oListener;
    
    // var _pStartPosExit;
    
    // var _oContainer;
    this.state = {
        container: null,
        exitButton: null,
        hitArea: null,
        listener: null
    }
    
    this.initCreditsPanel = () => {
        this.state.container = new createjs.Container();
        mainInstance().getStage().addChild(this.state.container);
        
        // _oBg = createBitmap(CSpriteLibrary.getSprite('msg_box'));
        this.state.container.addChild(createBitmap(CSpriteLibrary.getSprite('msg_box')));
        
        this.state.hitArea = new createjs.Shape();
        this.state.hitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT);
        this.state.hitArea.alpha = 0.01;
        this.state.listener = this.state.hitArea.on("click", this._onLogoButRelease);
        this.state.container.addChild(this.state.hitArea);
                
        const butExitSprite = CSpriteLibrary.getSprite('but_exit');
        const startExitPosition  = { x: 1230 , y: 340 };
        this.state.exitButton = new CGfxButton(startExitPosition.x, startExitPosition.y, butExitSprite, this.state.container);
        this.state.exitButton.addEventListener(settings.ON_MOUSE_UP, this.unload, this);
       
        const _oMsgText = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + settings.SECONDARY_FONT, "#fff");
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
	    _oMsgText.x = settings.CANVAS_WIDTH/2;
        _oMsgText.y = settings.CANVAS_HEIGHT/2 - 54;
	    this.state.container.addChild(_oMsgText);
		
        const ctlLogoSprite = CSpriteLibrary.getSprite('ctl_logo');
        const _oButLogo = createBitmap(ctlLogoSprite);
        _oButLogo.regX = ctlLogoSprite.width / 2;
        _oButLogo.regY = ctlLogoSprite.height / 2;
        _oButLogo.x = settings.CANVAS_WIDTH / 2;
        _oButLogo.y = settings.CANVAS_HEIGHT / 2;
        this.state.container.addChild(_oButLogo);
        
        const _oLink = new createjs.Text("www.ecoblock.com", "36px " + settings.SECONDARY_FONT, "#fff");
        _oLink.textAlign = "center";
        _oLink.textBaseline = "alphabetic";
	    _oLink.x = settings.CANVAS_WIDTH / 2;
        _oLink.y = (settings.CANVAS_HEIGHT / 2) + 70;
        this.state.container.addChild(_oLink);
    };

    
    this.unload = () => {
        this.state.hitArea.off("click", this.state.listener);
        this.state.exitButton.unload(); 
        this.state.exitButton = null;

        mainInstance().getStage().removeChild(this.state.container);
    };
    
    this._onLogoButRelease = () => {
        window.open("http://www.ecoblock.com/index.php?&l=en","_blank");
    };
    
    this.initCreditsPanel();
};

export default CCreditsPanel;



