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
    // var _bWin;

    // var _iBank;
    // var _iCurBet;
    // var _iCurPlayerMoney;
    // var _iTotalNum;
    var _iHitsNumber;
    var _iCountPlays;
    var _iAdCounter;
    
    // var _aCell;
    // var _aNumSelected;
    // var _aListSelected;
    var _aCombination;

    // var _oInterface;
    var _oEndPanel = null;
    // var _oParent;
    var _oCellContainer;
    // var _oPayoutsTable;
    // var _oAnimBalls;
    var _oBlockScreen;

    settings.setPayOuts(oData.payouts)
    settings.setBankMoney(oData.bank_money)
    settings.setPlayerMoney(oData.start_player_money)
    settings.setAnimationSpeed(oData.animation_speed)

    this.state = {
        isWin: false,
        win_occurrence: oData.win_occurrence || [],
        payOuts: settings.getPayOuts() || [],
        bankMoney: settings.getBankMoney(),
        betting: null,
        playerMoney: 0,
        selectedNumberCnt: 0,
        nums: [],
        selectedNums: [],
        adShowCounter: oData.ad_show_counter || null
    }

    this.cells = []
    this.payoutsInstance = null
    this.interfaceInstance = null
    this.animalBallInstance = null
    
    this.initCGame = () => {
        // _bTouchActive = false;
        // _bInitGame = true;
        
        // _iBank = settings.BANK;
        this.state.playerMoney = settings.getPlayerMoney();
        this.state.betting = settings.BET[3];
        // _iTotalNum = 0;
        _iCountPlays = 1;
        _iAdCounter = 0;
        
        // _aListSelected = [];
        
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
        _oBlockScreen.on('click;', function(){});
        _oBlockScreen.visible = false;
        mainInstance().getStage().addChild(_oBlockScreen);

		if(this.state.betting > this.state.playerMoney) {
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
        this.state.nums = [];
        let iNewHeight = 0;
        for (let i = 0; i < 80; i += 1) {
            this.cells[i] = new CNumToggle(oStartPos.x +(i % iNumCol) * iCellWidth, oStartPos.y + iCellHeight * iNewHeight, i + 1, _oCellContainer);
            this.cells[i].addEventListenerWithParams(settings.ON_MOUSE_UP, this.clickNumber, this, i);
            if (i % iNumCol === iNumCol - 1) {
                iNewHeight += 1;
            }            
            this.state.nums[i] = false;
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
        this._clearAllSelected();

        if (this.state.nums[iNum]) {
            this.state.selectedNumberCnt -= 1;
            this.state.nums[iNum] = false;
            for (let i = 0; i < this.state.selectedNums.length; i += 1) {
                if (this.state.selectedNums[i] === iNum) {
                    this.state.selectedNums.splice(i, 1);
                }
            }            
        } else {
            // _iTotalNum += 1;
            this.state.selectedNumberCnt += 1;
            this.state.nums[iNum] = true;
            this.state.selectedNums.push(iNum);
        }
        
        for (let i = 0; i < this.state.selectedNums.length; i += 1) {
            this.cells[this.state.selectedNums[i]].setActive(true);
        }
        
        this.activateButton();
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
        
        if (this.state.selectedNumberCnt > 9) {
            for( let i = 0; i < this.state.nums.length; i += 1) {
                if (!this.state.nums[i]) {
                    this.cells[i].block(true);
                }
            }
        } else {
            for (let i = 0; i < this.state.nums.length; i += 1) {
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
            if (this.state.betting * 5 > this.state.playerMoney) {
                this.interfaceInstance.enablePlay5(false);
            } else {
                this.interfaceInstance.enablePlay5(true);
            }
        }
    };
   
    this.clearSelection = () => {    
        this.state.selectedNums = [];
        this.clearAllExtracted();
        
        this.state.selectedNumberCnt = 0;
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
        
        for(let i = 0; i < this.state.nums.length; i += 1) {
            this.state.nums[i] = false;
            this.cells[i].block(false);
            this.cells[i].setActive(false);
        }

        this.activateButton();
    };
   
    this.undoSelection = () => {
        this.clearAllExtracted();
        
        if(this.state.selectedNumberCnt === 0) {
            return;
        }
        const iNum = this.state.selectedNums.pop();
        this.state.selectedNumberCnt -= 1;
        this.state.nums[iNum] = false;
        this.cells[iNum].setActive(false);
        for(let i = 0; i < this.state.nums.length; i += 1) {
            this.cells[i].block(false);
        }
        this.activateButton();
        this.payoutsInstance.updatePayouts(this.state.selectedNumberCnt - 1);
    };
    
    this.selectBet = (szType) => {
        this.clearAllExtracted();
        
        var iIndex;
        for(let i = 0; i < settings.BET.length; i += 1) {
            if(settings.BET[i] === this.state.betting) {
                iIndex = i;
            }
        }
        
        if (szType === 'add') {
            if (iIndex !== settings.BET.length-1 && settings.BET[iIndex +1] <= this.state.playerMoney) {
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
        _iAdCounter += 1;
        if(_iAdCounter === this.state.adShowCounter) {
            _iAdCounter = 0;
            $(mainInstance()).trigger("show_interlevel_ad");
        }
    };
   
    this.play = () => {
        //Detect max prize to win
        this.clearAllExtracted();

        if(this.state.selectedNumberCnt < 2) {
            return;
        }
        
        this.smartBlockGUI(false);
        this.state.playerMoney -= this.state.betting;
        this.state.bankMoney += this.state.betting;

        this.state.playerMoney = parseFloat(this.state.playerMoney.toFixed(1));          
        this.interfaceInstance.refreshMoney(this.state.playerMoney);

                
        let winningIndex = null;
        for(let i = 0; i < settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays.length; i += 1) {
            const iTotalWin = settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays[i] * this.state.betting;
            if (iTotalWin <= this.state.bankMoney) {
                winningIndex = i;
                break;
            }
        }

        if (winningIndex === null) {
            this.extractLosingCombination();
        } else {
            this.checkWin(winningIndex);
        }   
        
        $(mainInstance()).trigger("bet_placed",{ tot_bet: this.state.betting, money: this.state.playerMoney, num_selected: this.state.selectedNumberCnt });
    };
   
    this.checkWin = (winningIndex) => {
        const winProbalbility = Math.random() * 100;
        if(winProbalbility < this.state.win_occurrence[this.state.selectedNumberCnt - 1]) {
            this.extractWinCombination(winningIndex);
        } else {
            this.extractLosingCombination();
        }        
    };
   
    this.extractWinCombination = (iMaxWinIndex) => {
        this.state.isWin = true;
        const aWinOccurrenceList = [];
        for(let i = settings.getPayOuts()[this.state.selectedNumberCnt - 1].pays.length-1; i >= iMaxWinIndex; i -= 1) {
            for(let j = 0; j < settings.getPayOuts()[this.state.selectedNumberCnt - 1].occurrence[i]; j += 1) {
                aWinOccurrenceList.push(settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits[i]);
            }
        }
        
        const iRandWinIndex = Math.floor(Math.random() * aWinOccurrenceList.length);
        
        //Copy win numbers
        const aWinTempList = [];
        for(let i = 0; i < this.state.selectedNums.length; i += 1) {
            aWinTempList[i] = this.state.selectedNums[i] + 1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        const aLoseTempList = [];
        for (let i = 0; i < this.state.nums.length; i += 1) {
            if (!this.state.nums[i]) {
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for (let i = 0; i < 20; i += 1) {
            if (i < aWinOccurrenceList[iRandWinIndex]) {
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);       
        //_oPayoutsTable.highlightWin(aWinOccurrenceList[iRandWinIndex])
        for (let i = 0; i < 20; i += 1) {
            //_aCell[_aCombination[i]-1].setExtracted(true);           
        }  
        
        _iHitsNumber = aWinOccurrenceList[iRandWinIndex];
        this.animExtraction();
    };
   
    this.extractLosingCombination = () => {
        this.state.isWin = false;
        
        const iMaxFakeWinNumber = (settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits[settings.getPayOuts()[this.state.selectedNumberCnt - 1].hits.length - 1]) -1;
        const iWinNumberToExtract = Math.round(Math.random() * iMaxFakeWinNumber);
        //Copy win numbers
        const aWinTempList = [];
        for (let i = 0; i < this.state.selectedNums.length; i += 1) {
            aWinTempList[i] = this.state.selectedNums[i] + 1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        var aLoseTempList = [];
        for (let i = 0; i < this.state.nums.length; i += 1) {
            if (!this.state.nums[i]) {
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for(let i = 0; i < 20; i += 1) {
            if (i < iWinNumberToExtract) {
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);
        
        _iHitsNumber = 0;
        this.animExtraction();
    };
    
    this.animExtraction = () => {   
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
                this.state.playerMoney += iTotalWin;
                this.state.bankMoney -= iTotalWin;
                this.payoutsInstance.showWin(iTotalWin);
                this.payoutsInstance.highlightWin(_iHitsNumber);
				
                break;
            }
        }        
        this.interfaceInstance.refreshMoney(this.state.playerMoney);
        
        if (this.state.isWin) {
            playSound("win", 1, false);
        }
        //trace("_iCurPlayerMoney: "+_iCurPlayerMoney);
		//trace("_iBank: "+_iBank);
        
        this.animalBallInstance.resetBalls();
        this.highlightCell();
        
        //////CHECK IF CAN CONTINUE GAME////
        
        $(mainInstance()).trigger("save_score", this.state.playerMoney);
        if(this.state.betting > this.state.playerMoney) {
            var iNewIndex = null;
            for (let i = 0; i < settings.BET.length; i += 1) {
                if(settings.BET[i] <= this.state.playerMoney) {
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
   
    this.clearAllExtracted = () => {
        //createjs.Tween.removeAllTweens();
        this.payoutsInstance.showWin(0);
        this.payoutsInstance.stopHighlight();
        for(let i = 0; i < this.state.nums.length; i += 1) {
            this.cells[i].setExtracted(false, 0);
        }
        
        for(let j = 0; j < this.state.selectedNums.length; j += 1) {
            this.cells[this.state.selectedNums[j]].setActive(true);          
        }       
    };
    
    this._clearAllSelected = () => {
        //createjs.Tween.removeAllTweens();
        this.payoutsInstance.showWin(0);
        this.payoutsInstance.stopHighlight();
        for(let i = 0; i < this.state.nums.length; i += 1) {
            this.cells[i].setExtracted(false,0);
        }       
    };
    
    this.smartBlockGUI = (bVal) => {
        this.tryShowAd();
        
        if (bVal) {
            _oBlockScreen.visible = false;
            this.interfaceInstance.enableAllButton(true);
            
            if(this.state.betting * 5  <= this.state.playerMoney) {
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
        return this.state.playerMoney;
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
            for(let j = 0; j < this.state.selectedNums.length; j += 1) {
                if(_aCombination[i] === this.state.selectedNums[j] + 1) {
                    this.cells[this.state.selectedNums[j]].highlight();
                }                
            }           
        }
    };

    this.update = () => {};

    this.initCGame();
}

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

