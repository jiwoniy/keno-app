import createjs from './createjs.js'

import {
    createBitmap,
} from './ctl_utils.js'
import {
    mainInstance,
} from './CMain.js'

function CDisplayPanel(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize){
    
    // var _bBlock;
    
    // var _iScale;
    
    // var _aCbCompleted;
    // var _aCbOwner;
    // var _oPanel;
    // var _oText;
    // var _oTextBack;
    this.state = {
        panel: null,
        text: null,
        textBack: null,
    }
    
    this._init =(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize) => {
        
        // _bBlock = false;
        
        // _iScale = 1;
        
        // _aCbCompleted = [];
        // _aCbOwner = [];

        var oButtonBg = createBitmap( oSprite);

        var iStepShadow = Math.ceil(iFontSize/20);

        this.state.textBack = new createjs.Text(szText, 
            // iFontSize+"px "+szFont,
            `${iFontSize}px ${szFont}`,
            '#000000');
        this.state.textBack.textAlign = 'center';
        this.state.textBack.textBaseline = 'alphabetic';
        const textBackBounds = this.state.textBack.getBounds();    
        this.state.textBack.x = oSprite.width/2 + iStepShadow;
        this.state.textBack.y = Math.floor(oSprite.height / 2) +(textBackBounds.height / 3) + iStepShadow;

        this.state.text = new createjs.Text(szText, 
            // iFontSize+"px "+szFont,
            `${iFontSize}px ${szFont}`,
            '#000000');
        this.state.text.textAlign = "center";
        this.state.text.textBaseline = "alphabetic";
        const testBounds = this.state.text.getBounds();    
        this.state.text.x = oSprite.width/2;
        this.state.text.y = Math.floor(oSprite.height / 2) +(testBounds.height / 3);

        this.state.panel = new createjs.Container();
        this.state.panel.x = iXPos;
        this.state.panel.y = iYPos;
        this.state.panel.regX = oSprite.width / 2;
        this.state.panel.regY = oSprite.height / 2;
        this.state.panel.addChild(oButtonBg, this.state.textBack, this.state.text);

        mainInstance().getStage().addChild(this.state.panel);
    };
    
    this.unload = () => {       
        mainInstance().getStage().removeChild(this.state.panel);
    };
    
    this.setVisible = (bVisible) => {
        this.state.panel.visible = bVisible;
    };    
    
    this.setTextPosition = (iY) => {
        this.state.text.y= iY;
        this.state.textBack.y = iY + 2;
    };
    
    this.setText = function(szText){
        this.state.text.text = szText;
        this.state.textBack.text = szText;
    };
    
    this.setPosition = (iXPos,iYPos) => {
        this.state.panel.x = iXPos;
        this.state.panel.y = iYPos;
    };
    
    this.setX = (iXPos) => {
        this.state.panel.x = iXPos;
    };
    
    this.setY = (iYPos) => {
        this.state.panel.y = iYPos;
    };
    
    this.getButtonImage = () => {
        return this.state.panel;
    };

    this.getX = () => {
        return this.state.panel.x;
    };
    
    this.getY = () => {
        return this.state.panel.y;
    };

    this.setScale = (iVal) => {
        // _iScale = iVal;
        this.state.panel.scaleX = iVal;
        this.state.panel.scaleY = iVal;
    };

    this._init(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize);
    
    return this;
    
}

export default CDisplayPanel;

