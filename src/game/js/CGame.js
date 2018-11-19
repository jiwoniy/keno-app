import $ from 'jquery'

import createjs from './createjs.js'
import {
    createBitmap,
    shuffle,
    playSound
} from './ctl_utils.js'
import CSpriteLibrary from './sprite_lib'
import {
    mainInstance,
} from './CMain.js'

import settings from './settings.js'
import CInterface from './CInterface.js'
import CPayouts from './CPayouts.js'
import CAnimBalls from './CAnimBalls.js'
import CEndPanel from './CEndPanel.js'
import CNumToggle from './CNumToggle.js'

function CGame(oData) {
    var _bWin;

    // var _iBank;
    // var _iCurBet;
    var _iCurPlayerMoney;
    // var _iTotalNum;
    var _iHitsNumber;
    var _iCountPlays;
    var _iAdCounter;
    
    // var _aCell;
    // var _aNumSelected;
    var _aListSelected;
    var _aCombination;

    // var _oInterface;
    var _oEndPanel = null;
    // var _oParent;
    var _oCellContainer;
    // var _oPayoutsTable;
    // var _oAnimBalls;
    var _oBlockScreen;

    this.state = {
        win_occurrence: oData.win_occurrence || [],
        payOuts: settings.getPayOuts() || [],
        bank: settings.getBankMoney(),
        betting: null,
        selectedNumberCnt: 0,
        selectedNums: []
    }

    this.cells = []
    this.payoutsInstance = null
    this.interfaceInstance = null
    this.animalBallInstance = null
    
    this.initCGame = () => {
        // _bTouchActive = false;
        // _bInitGame = true;
        
        // _iBank = settings.BANK;
        _iCurPlayerMoney = settings.getPlayerMoney();
        this.state.betting = settings.BET[3];
        // _iTotalNum = 0;
        _iCountPlays = 1;
        _iAdCounter = 0;
        
        _aListSelected = [];

        console.log(`_iCurBet: ${this.state.betting}`)
        
        // var oBg = createBitmap(CSpriteLibrary.getSprite('bg_game'));
        mainInstance().getStage().addChild(createBitmap(CSpriteLibrary.getSprite('bg_game'))); 
        this.interfaceInstance = new CInterface(true, this);
        this.interfaceInstance.refreshBet(this.state.betting);           
 
        _oCellContainer = new createjs.Container();
        _oCellContainer.x = settings.CANVAS_WIDTH/2;
        _oCellContainer.y = settings.CANVAS_HEIGHT/2;
        mainInstance().getStage().addChild(_oCellContainer);

        this.initCells();        

        this.payoutsInstance = new CPayouts(1360, 203);

        const holeSprite = CSpriteLibrary.getSprite('hole');
        const oHole = createBitmap(holeSprite);
        oHole.regX = holeSprite.width / 2;
        oHole.regY = holeSprite.height / 2;
        oHole.x = 365;
        oHole.y = 750;
        mainInstance().getStage().addChild(oHole);

        this.animalBallInstance = new CAnimBalls(365, 260);
        
        // var oSprite = CSpriteLibrary.getSprite('tube');
        const oTube = createBitmap(CSpriteLibrary.getSprite('tube'));
        oTube.x = 315;
        oTube.y = 205;
        mainInstance().getStage().addChild(oTube);
        
        const graphics = new createjs.Graphics().beginFill("rgba(158,158,158,0.01)").drawRect(0, 200, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT-200);
        _oBlockScreen = new createjs.Shape(graphics);
        _oBlockScreen.on("click", function(){});
        _oBlockScreen.visible = false;
        mainInstance().getStage().addChild(_oBlockScreen);

		if(this.state.betting > _iCurPlayerMoney) {
            for(let i = 0; i < 80; i += 1) {
                this.cells[i].block(true);
            }
        }
    };
    
    this.initCells = () => {
        const numButtonSprite = CSpriteLibrary.getSprite('num_button');
        var iCellWidth = (numButtonSprite.width / 2) - 5;
        var iCellHeight = numButtonSprite.height - 5;
        
        var iNumRow = 8;
        var iNumCol = 10;
        
        var oStartPos = {x: - (iNumCol * iCellWidth) / 2 + (iCellWidth / 2) - 40, y: -(iNumRow * iCellHeight) / 2 + (iCellHeight / 2) + 10};
     
        // _aCell = [];
        this.state.selectedNums = [];
        var iNewHeight = 0;
        for (let i = 0; i < 80; i += 1) {
            this.cells[i] = new CNumToggle(oStartPos.x +(i % iNumCol) * iCellWidth, oStartPos.y + iCellHeight * iNewHeight, i + 1, _oCellContainer);
            this.cells[i].addEventListenerWithParams(settings.ON_MOUSE_UP, this.clickNumber, this, i);
            if (i % iNumCol === iNumCol - 1) {
                iNewHeight++;
            }            
            this.state.selectedNums[i] = false;
        }

        const numberSprite = CSpriteLibrary.getSprite('number')
        const oNumber = createBitmap(numberSprite);
        oNumber.regX = numberSprite.width / 2;
        oNumber.regY = numberSprite.height / 2;
        oNumber.x = (settings.CANVAS_WIDTH / 2) - 35;
        oNumber.y = (settings.CANVAS_HEIGHT / 2) + 10;
        mainInstance().getStage().addChild(oNumber);

    };
    
    this.clickNumber = (iNum) => {
        console.log('---clickNumber---')
        console.log(`iNum: ${iNum}`)
        console.log(`selected number: ${this.state.selectedNumberCnt}`)
        this._clearAllSelected();

        if (this.state.selectedNums[iNum]) {
            this.state.selectedNumberCnt -= 1;
            this.state.selectedNums[iNum] = false;
            for (let i = 0; i < _aListSelected.length; i += 1) {
                if (_aListSelected[i] === iNum) {
                    _aListSelected.splice(i,1);
                }
            }            
        } else {
            // _iTotalNum += 1;
            this.state.selectedNumberCnt += 1;
            this.state.selectedNums[iNum] = true;
            _aListSelected.push(iNum);
        }
        
        for (let i = 0; i < _aListSelected.length; i += 1) {
            this.cells[_aListSelected[i]].setActive(true);
        }

        console.log(`selected number: ${this.state.selectedNumberCnt}`)
        
        this.activateButton();
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
        
        if (this.state.selectedNumberCnt > 9) {
            for( let i = 0; i < this.state.selectedNums.length; i += 1) {
                if (!this.state.selectedNums[i]) {
                    this.cells[i].block(true);
                }
            }
        } else {
            for (let i = 0; i < this.state.selectedNums.length; i += 1) {
                this.cells[i].block(false);
            }
        }        
    };
   
    this.activateButton = () => {
        if (this.state.selectedNumberCnt < 2) {
            this.interfaceInstance.enablePlay1(false);
            this.interfaceInstance.enablePlay5(false);
        } else {
            this.interfaceInstance.enablePlay1(true);
            if (this.state.betting * 5 > _iCurPlayerMoney) {
                this.interfaceInstance.enablePlay5(false);
            } else {
                this.interfaceInstance.enablePlay5(true);
            }
        }
    };
   
    this.clearSelection = () => {    
        _aListSelected = [];
        
        this._clearAllExtracted();
        
        this.state.selectedNumberCnt = 0;
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
        
        for(let i = 0; i < this.state.selectedNums.length; i += 1) {
            this.state.selectedNums[i] = false;
            this.cells[i].block(false);
            this.cells[i].setActive(false);
        }

        this.activateButton();
    };
   
    this.undoSelection = () => {
        this._clearAllExtracted();
        
        if(this.state.selectedNumberCnt === 0) {
            return;
        }
        var iNum = _aListSelected.pop();
        this.state.selectedNumberCnt -= 1;
        this.state.selectedNums[iNum] = false;
        this.cells[iNum].setActive(false);
        for(let i = 0; i < this.state.selectedNums.length; i += 1) {
            this.cells[i].block(false);
        }
        this.activateButton();
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
    };
    
    this.selectBet = (szType) => {
        this._clearAllExtracted();
        
        var iIndex;
        for(let i = 0; i < settings.BET.length; i += 1) {
            if(settings.BET[i] === this.state.betting) {
                iIndex = i;
            }
        }
        
        if (szType === 'add') {
            if (iIndex !== settings.BET.length-1 && settings.BET[iIndex +1] <= _iCurPlayerMoney) {
                iIndex++;
            }
        } else {
            if (iIndex !== 0) {
                iIndex--;
            }
        }
        
        this.state.betting = settings.BET[iIndex];
        this.interfaceInstance.refreshBet(this.state.betting);
        this.activateButton();
    };
   
    this.play5 = () => {
        _iCountPlays = 5;
        this.play();        
    };
    
    this.tryShowAd = () => {
        _iAdCounter++;
        if(_iAdCounter === AD_SHOW_COUNTER) {
            _iAdCounter = 0;
            $(mainInstance()).trigger("show_interlevel_ad");
        }
    };
   
    this.play = () => {
        console.log('--play--')
        //Detect max prize to win
        this._clearAllExtracted();

        if(this.state.selectedNumberCnt < 2) {
            return;
        }
        
        this.smartBlockGUI(false);
        _iCurPlayerMoney -= this.state.betting;
        this.state.bank += this.state.betting;
        _iCurPlayerMoney = parseFloat(_iCurPlayerMoney.toFixed(1));          
        this.interfaceInstance.refreshMoney(_iCurPlayerMoney);
        
        console.log('-----')
        console.log(`_iTotalNum: ${this.state.selectedNumberCnt}`)
        console.log(settings.getPayOuts())
        let iWinIndex = null;
        for(let i = 0; i < settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays.length; i += 1) {
            const iTotalWin = settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays[i] * this.state.betting;
            if (iTotalWin <= this.state.bank) {
                iWinIndex = i;
                break;
            }
        }

        console.log(iWinIndex)
        if (iWinIndex === null) {
            this._extractLosingCombination();
        } else {
            this._checkWin(iWinIndex);
        }   
        
        $(mainInstance()).trigger("bet_placed",{ tot_bet: this.state.betting, money: _iCurPlayerMoney, num_selected: this.state.selectedNumberCnt });
    };
   
    this._checkWin = (iMaxWinIndex) => {
        var iRandWin = Math.random() * 100;
        if(iRandWin < this.state.win_occurrence[this.state.selectedNumberCnt - 1]) {
            this._extractWinCombination(iMaxWinIndex);
            
        } else {
            this._extractLosingCombination();
        }        
    };
   
    this._extractWinCombination = (iMaxWinIndex) => {
        _bWin = true;
        const aWinOccurrenceList = [];
        for(let i = settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays.length-1; i >= iMaxWinIndex; i -= 1) {
            for(let j = 0; j < settings.getPayOuts()[this.state.selectedNumberCnt - 1].occurrence[i]; j += 1) {
                aWinOccurrenceList.push(settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits[i]);
            }
        }
        
        const iRandWinIndex = Math.floor(Math.random()*aWinOccurrenceList.length);
        
        //Copy win numbers
        const aWinTempList = [];
        for(let i = 0; i < _aListSelected.length; i += 1) {
            aWinTempList[i] = _aListSelected[i]+1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        const aLoseTempList = [];
        for (let i = 0; i < this.state.selectedNums.length; i += 1) {
            if (!this.state.selectedNums[i]) {
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for (let i = 0; i < 20; i += 1) {
            if (i<aWinOccurrenceList[iRandWinIndex]) {
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);       
        //_oPayoutsTable.highlightWin(aWinOccurrenceList[iRandWinIndex])
        for(let i = 0; i < 20; i += 1) {
            //_aCell[_aCombination[i]-1].setExtracted(true);           
        }  
        
        _iHitsNumber = aWinOccurrenceList[iRandWinIndex];
        this._animExtraction();
        
    };
   
    this._extractLosingCombination = () => {
        _bWin = false;
        
        var iMaxFakeWinNumber = (settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits[settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits.length - 1]) -1;
        
        var iWinNumberToExtract = Math.round(Math.random()*iMaxFakeWinNumber);
        //Copy win numbers
        var aWinTempList = [];
        for(var i=0; i<_aListSelected.length; i++){
            aWinTempList[i] = _aListSelected[i]+1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        var aLoseTempList = [];
        for (let i = 0; i < this.state.selectedNums.length; i += 1) {
            if (!this.state.selectedNums[i]) {
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for(let i = 0; i < 20; i += 1) {
            if (i<iWinNumberToExtract) {
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);
        
        _iHitsNumber = 0;
        this._animExtraction();
    };
    
    this._animExtraction = () => {   
        //Calculate ball final position
        const aBallPos = [];
        for(let i = 0; i < 20; i += 1) {
            aBallPos.push(this.cells[(_aCombination[i] -1)].getGlobalPosition())
        }

        this.animalBallInstance.startAnimation(aBallPos);        
    };
   
    this._checkContinueGame = () => { 
        //Update Money
        for(let i = 0; i < settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits.length; i += 1) {
            if(settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits[i] === _iHitsNumber) {
                var iTotalWin = (this.state.betting * settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays[i]);
                iTotalWin = parseFloat(iTotalWin.toFixed(1));
                _iCurPlayerMoney += iTotalWin;
                this.state.bank -= iTotalWin;
                this.payoutsInstance.showWin(iTotalWin);
                this.payoutsInstance.highlightWin(_iHitsNumber);
				
                break;
            }
        }        
        this.interfaceInstance.refreshMoney(_iCurPlayerMoney);
        
        if (_bWin) {
            playSound("win", 1, false);
        }
        //trace("_iCurPlayerMoney: "+_iCurPlayerMoney);
		//trace("_iBank: "+_iBank);
        
        this.animalBallInstance.resetBalls();
        this.highlightCell();
        
        //////CHECK IF CAN CONTINUE GAME////
        
        $(mainInstance()).trigger("save_score",_iCurPlayerMoney);
        if(this.state.betting > _iCurPlayerMoney) {
            var iNewIndex = null;
            for (let i = 0; i < settings.BET.length; i += 1) {
                if(settings.BET[i]<=_iCurPlayerMoney) {
                    iNewIndex = i;                    
                }
            }
            if (iNewIndex !== null) {
                this.state.betting = settings.BET[iNewIndex];
                this.interfaceInstance.refreshBet(this.state.betting);
            } else {
                //END GAME
                this.gameOver();
                return;
            }        
            
        }
        
        if (_iCountPlays === 1) {
            this.smartBlockGUI(true);
            return;
        } else {
            _iCountPlays--;
            setTimeout(() => {
                this.play();
            }, 2000);
        }
        
        
        /////////////////////////////////////
    };
   
    this.showExtracted = (iIndex, iColor) => {
        this.cells[_aCombination[iIndex]-1].setExtracted(true,iColor);
    };
   
    this._clearAllExtracted = () => {
        //createjs.Tween.removeAllTweens();
        this.payoutsInstance.showWin(0);
        this.payoutsInstance.stopHighlight();
        for(let i = 0; i < this.state.selectedNums.length; i += 1) {
            this.cells[i].setExtracted(false,0);
        }
        
        for(let j = 0; j < _aListSelected.length; j += 1) {
            this.cells[_aListSelected[j]].setActive(true);          
        }       
    };
    
    this._clearAllSelected = () => {
        //createjs.Tween.removeAllTweens();
        this.payoutsInstance.showWin(0);
        this.payoutsInstance.stopHighlight();
        for(let i = 0; i < this.state.selectedNums.length; i += 1) {
            this.cells[i].setExtracted(false,0);
        }       
    };
    
    this.smartBlockGUI = (bVal) => {
        this.tryShowAd();
        
        if (bVal) {
            _oBlockScreen.visible = false;
            this.interfaceInstance.enableAllButton(true);
            
            if(this.state.betting * 5  <= _iCurPlayerMoney) {
                this.interfaceInstance.enablePlay5(true);
            } else {
                this.interfaceInstance.enablePlay5(false);
            }
            
        } else {
            _oBlockScreen.visible = true;
            this.interfaceInstance.enableAllButton(false);
        }
    };
    
    this.getCurMoney = () => {
        return _iCurPlayerMoney;
    };
       
    
    this.unload = () => {
        // _bInitGame = false;
        this.interfaceInstance.unload();
        if(_oEndPanel !== null) {
            _oEndPanel.unload();
        }
        
        createjs.Tween.removeAllTweens();
        mainInstance().getStage().removeAllChildren();

    };
 
    this.onExit = function() {
        this.unload();
        mainInstance().gotoMenu();
    };
    
    // this._onExitHelp = function () {
    //      _bStartGame = true;
    // };
    
    this.gameOver = () => {
        _oEndPanel = CEndPanel(CSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show();
    };

    this.highlightCell = () => {
        for(let i = 0; i < _aCombination.length; i += 1) {
            for(let j = 0; j < _aListSelected.length; j += 1) {
                if(_aCombination[i] === _aListSelected[j]+1){
                    this.cells[_aListSelected[j]].highlight();
                }                
            }           
        }
    };

    this.update = () => {
        
    };
    
    // WIN_OCCURRENCE = oData.win_occurrence;
    settings.setPayOuts(oData.payouts)
    // settings.BANK = oData.bank_money;
    settings.setBankMoney(oData.bank_money)
    // settings.START_PLAYER_MONEY = oData.start_player_money;
    settings.setPlayerMoney(oData.start_player_money)
    settings.ANIMATION_SPEED = oData.animation_speed;
    
    AD_SHOW_COUNTER = oData.ad_show_counter;
    
    // _oParent=this;
    this.initCGame();
}


var AD_SHOW_COUNTER

const Singleton = (() => {
    let instance;
    function createInstance(data) {
        return new CGame(data);
    }
  
    return {
      getInstance: (isConstructor = false, data) => {
        if (isConstructor) {
            instance = createInstance(data);
        } else if (!isConstructor && !instance) {
            instance = createInstance(data);
        }
        return instance;
      },
    };
})();
const gameInstance = () => Singleton.getInstance(false)

// Need Instance & constructor
export default Singleton.getInstance;
export {
    gameInstance
}

