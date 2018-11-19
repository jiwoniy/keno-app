import createjs from './createjs.js'
import {
    createBitmap,
} from './ctl_utils.js'
import settings from './settings.js'

import CSpriteLibrary from './sprite_lib'
import {
    mainInstance,
} from './CMain.js'
import {
    TEXT_CURRENCY,
    TEXT_PAYS,
    TEXT_HITS,
    TEXT_PAYOUTS,
} from './CLang.js'

function CPayouts(iX, iY) {
    var _iCurAlpha = 0;
    var _iHighlightIndex;
    
    var _oPanel;
    var _oTextHits;
    var _oTextPays;
    var _oTextPayouts;
    // var _oHighlightHits;
    // var _oHighlightPays;
    var _oMoneyText;
    // var _oParent;
    
    var _aPayoutsPosY;
    // var _aHitsText;
    // var _aPaysText;

    this.state = {
        hitsText: [],
        paysText: []
    }
    
  
    this._init = (iX, iY) => {
        _oPanel = new createjs.Container();
        _oPanel.x = iX;
        _oPanel.y = iY;
        mainInstance().getStage().addChild(_oPanel);
        
        var oBg = createBitmap(CSpriteLibrary.getSprite('payouts'));
        
        var oWinBg = createBitmap(CSpriteLibrary.getSprite('win_panel'));
        oWinBg.x = -6;
        oWinBg.y = 577;
        
        var iHitsX = 80;
        var iPaysX = 210;
        
        _oTextPayouts = new createjs.Text(TEXT_PAYOUTS," 34px " +settings.PRIMARY_FONT, "#ffffff");
        _oTextPayouts.x = 150;
        _oTextPayouts.y = 40;
        _oTextPayouts.textAlign = "center";
        _oTextPayouts.textBaseline = "middle";
        _oTextPayouts.lineWidth = 400;
        
        _oTextHits = new createjs.Text(TEXT_HITS," 30px "+settings.PRIMARY_FONT, "#ffffff");
        _oTextHits.x = iHitsX;
        _oTextHits.y = 130;
        _oTextHits.textAlign = "center";
        _oTextHits.textBaseline = "alphabetic";
        _oTextHits.lineWidth = 400;
        
        _oTextPays = new createjs.Text(TEXT_PAYS," 30px "+settings.PRIMARY_FONT, "#ffffff");
        _oTextPays.x = iPaysX;
        _oTextPays.y = 130;
        _oTextPays.textAlign = "center";
        _oTextPays.textBaseline = "alphabetic";
        _oTextPays.lineWidth = 400;
        
        _oPanel.addChild(oBg, _oTextHits, _oTextPays, _oTextPayouts, oWinBg);
        
        
        var iOffset = 50;
        _aPayoutsPosY = [];
        // _aHitsText = [];
        // _aPaysText = [];
        for(let i = 0; i < 6; i += 1) {
            _aPayoutsPosY[i] = 190 + (i * iOffset);
            
            this.state.hitsText[i] = new createjs.Text("-","36px "+settings.PRIMARY_FONT, "#ffffff");
            this.state.hitsText[i].x = iHitsX;
            this.state.hitsText[i].y = _aPayoutsPosY[i];
            this.state.hitsText[i].textAlign = "center";
            this.state.hitsText[i].textBaseline = "middle";  
            _oPanel.addChild(this.state.hitsText[i]);
            
            this.state.paysText[i] = new createjs.Text("-","36px "+settings.PRIMARY_FONT, "#ffffff");
            this.state.paysText[i].x = iPaysX;
            this.state.paysText[i].y = _aPayoutsPosY[i];
            this.state.paysText[i].textAlign = "center";
            this.state.paysText[i].textBaseline = "middle";  
            _oPanel.addChild(this.state.paysText[i]);
        }
        
        _oMoneyText = new createjs.Text(TEXT_CURRENCY +"0","40px "+settings.PRIMARY_FONT, "#ffffff");
        _oMoneyText.x = 150;
        _oMoneyText.y = 646;
        _oMoneyText.textAlign = "center";
        _oMoneyText.textBaseline = "middle";  
        _oPanel.addChild(_oMoneyText);
        
    };    
    
    this.unload = function(){
        mainInstance().getStage().removeChild(_oPanel);
    };
    
    this.updatePayouts = function(iVal) {
        if (iVal < 0) {
            for (let i = 0; i < 6; i += 1) {
                this.state.hitsText[i].text = "-";
                this.state.paysText[i].text = "-";
            }
            return;
        }

        for(let i = 0; i < settings.getPayOuts()[iVal].hits.length; i += 1) {
            this.state.hitsText[i].text = settings.getPayOuts()[iVal].hits[i];
            this.state.paysText[i].text = settings.getPayOuts()[iVal].pays[i];
        }
        
        for(let i = settings.getPayOuts()[iVal].hits.length; i < 6; i += 1) {
            this.state.hitsText[i].text = "-";
            this.state.paysText[i].text = "-";
        }        
    };
    
    this.showWin = (szValue) => {
        _oMoneyText.text = TEXT_CURRENCY + szValue;
    };
    
    this.highlightWin = (iHits) => {
        for(let i = 0; i < 6; i += 1) {
            if(this.state.hitsText[i].text === iHits) {
                _iHighlightIndex = i;
                this._flicker(i);
                break;
            }
        }
    };
    
    this._flicker = (iIndex) => {
        if (_iCurAlpha === 1) {
            _iCurAlpha = 0;
            createjs.Tween.get(this.state.hitsText[iIndex]).to({alpha:_iCurAlpha }, 250,createjs.Ease.cubicOut);
            createjs.Tween.get(this.state.paysText[iIndex]).to({alpha:_iCurAlpha }, 250,createjs.Ease.cubicOut).call(this, function() {this._flicker(iIndex); });
        } else {
            _iCurAlpha = 1;
            createjs.Tween.get(this.state.hitsText[iIndex]).to({alpha:_iCurAlpha }, 250,createjs.Ease.cubicOut);
            createjs.Tween.get(this.state.paysText[iIndex]).to({alpha:_iCurAlpha }, 250,createjs.Ease.cubicOut).call(this, function(){ this._flicker(iIndex); });
        }
    };
    
    this.stopHighlight = () => {
        if (this.state.hitsText[_iHighlightIndex]) {
            createjs.Tween.removeTweens(this.state.hitsText[_iHighlightIndex]);
            createjs.Tween.removeTweens(this.state.paysText[_iHighlightIndex]);
            this.state.hitsText[_iHighlightIndex].alpha = 1;
            this.state.paysText[_iHighlightIndex].alpha = 1;
        }
    };
    
    this._init(iX, iY);
};

export default CPayouts;