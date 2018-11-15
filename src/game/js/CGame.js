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
    this.state = {
        win_occurrence: oData.win_occurrence || [],
        payOuts: settings.getPayOuts() || []
    }

    // var _bTouchActive;
    // var _bInitGame;
    var _bWin;

    var _iBank;
    var _iCurBet;
    var _iCurPlayerMoney;
    var _iTotalNum;
    var _iHitsNumber;
    var _iCountPlays;
    var _iAdCounter;
    
    var _aCell;
    var _aNumSelected;
    var _aListSelected;
    var _aCombination;

    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oCellContainer;
    var _oPayoutsTable;
    var _oAnimBalls;
    var _oBlockScreen;
    
    this.initCGame = function() {
        // _bTouchActive = false;
        // _bInitGame = true;
        
        _iBank = settings.BANK;
        _iCurPlayerMoney = settings.START_PLAYER_MONEY;
        _iCurBet = settings.BET[3];
        _iTotalNum = 0;
        _iCountPlays = 1;
        _iAdCounter = 0;
        
        _aListSelected = [];
        
        // var oBg = createBitmap(CSpriteLibrary.getSprite('bg_game'));
        mainInstance().getStage().addChild(createBitmap(CSpriteLibrary.getSprite('bg_game'))); 
        _oInterface = new CInterface(true);
        _oInterface.refreshBet(_iCurBet);           
 
        _oCellContainer = new createjs.Container();
        _oCellContainer.x = settings.CANVAS_WIDTH/2;
        _oCellContainer.y = settings.CANVAS_HEIGHT/2;
        mainInstance().getStage().addChild(_oCellContainer);

        this._initCells();        

        _oPayoutsTable = new CPayouts(1360,203);

        const holeSprite = CSpriteLibrary.getSprite('hole');
        var oHole = createBitmap(holeSprite);
        oHole.regX = holeSprite.width / 2;
        oHole.regY = holeSprite.height / 2;
        oHole.x = 365;
        oHole.y = 750;
        mainInstance().getStage().addChild(oHole);

        _oAnimBalls = new CAnimBalls(365, 260);
        
        // var oSprite = CSpriteLibrary.getSprite('tube');
        const oTube = createBitmap(CSpriteLibrary.getSprite('tube'));
        oTube.x = 315;
        oTube.y = 205;
        mainInstance().getStage().addChild(oTube);
        
        var graphics = new createjs.Graphics().beginFill("rgba(158,158,158,0.01)").drawRect(0, 200, settings.CANVAS_WIDTH, settings.CANVAS_HEIGHT-200);
        _oBlockScreen = new createjs.Shape(graphics);
        _oBlockScreen.on("click", function(){});
        _oBlockScreen.visible = false;
        mainInstance().getStage().addChild(_oBlockScreen);

		if(_iCurBet>_iCurPlayerMoney){
                for(var i=0; i<80; i++){
					_aCell[i].block(true);
				}
        }
    };
    
    this._initCells = function() {
      
        const numButtonSprite = CSpriteLibrary.getSprite('num_button');
        var iCellWidth = (numButtonSprite.width / 2) - 5;
        var iCellHeight = numButtonSprite.height - 5;
        
        var iNumRow = 8;
        var iNumCol = 10;
        
        var oStartPos = {x: - (iNumCol * iCellWidth) / 2 + (iCellWidth / 2) - 40, y: -(iNumRow * iCellHeight) / 2 + (iCellHeight / 2) + 10};
     
        _aCell = [];
        _aNumSelected = [];
        var iNewHeight = 0;
        for(var i=0; i<80; i++){
            _aCell[i] = new CNumToggle(oStartPos.x +(i%iNumCol)*iCellWidth, oStartPos.y + iCellHeight*iNewHeight, i+1, _oCellContainer);
            _aCell[i].addEventListenerWithParams(settings.ON_MOUSE_UP, this._onButNumRelease, this, i);
            if(i % iNumCol === iNumCol - 1) {
                iNewHeight++;
            }            
            _aNumSelected[i] = false;
        }

        const numberSprite = CSpriteLibrary.getSprite('number')
        const oNumber = createBitmap(numberSprite);
        oNumber.regX = numberSprite.width / 2;
        oNumber.regY = numberSprite.height / 2;
        oNumber.x = (settings.CANVAS_WIDTH / 2) - 35;
        oNumber.y = (settings.CANVAS_HEIGHT / 2) + 10;
        mainInstance().getStage().addChild(oNumber);

    };
    
    this._onButNumRelease = function(iNum){

        this._clearAllSelected();

        if(_aNumSelected[iNum]){
            _iTotalNum--;
            _aNumSelected[iNum] = false;
            for(var i=0; i<_aListSelected.length; i++){
                if(_aListSelected[i] === iNum){
                    _aListSelected.splice(i,1);
                }
            }            
        }else {
            _iTotalNum++;
            _aNumSelected[iNum] = true;
            _aListSelected.push(iNum);
        }
        
        for(let i=0; i<_aListSelected.length; i++){
            _aCell[_aListSelected[i]].setActive(true);
        }
        
        this._checkActiveButton();

        _oPayoutsTable.updatePayouts(_iTotalNum-1);
        
        if(_iTotalNum > 9){
            for(let i=0; i<_aNumSelected.length; i++){
                if(!_aNumSelected[i]){
                    _aCell[i].block(true);
                }
            }
        } else {
            for(let i=0; i<_aNumSelected.length; i++){
                    _aCell[i].block(false);
            }
        }        
    };
   
    this._checkActiveButton = function(){
        if(_iTotalNum<2){
            _oInterface.enablePlay1(false);
            _oInterface.enablePlay5(false);
            
        } else {
            _oInterface.enablePlay1(true);
            if(_iCurBet * 5 > _iCurPlayerMoney){
                _oInterface.enablePlay5(false);
            } else {
                _oInterface.enablePlay5(true);
            }
        }
    };
   
    this.clearSelection = function(){        
        
        _aListSelected = [];
        
        this._clearAllExtracted();
        
        _iTotalNum = 0;
        _oPayoutsTable.updatePayouts(_iTotalNum-1);
        
        for(var i=0; i<_aNumSelected.length; i++){
            _aNumSelected[i] = false;
            _aCell[i].block(false);
            _aCell[i].setActive(false);
        }

        this._checkActiveButton();
    };
   
    this.undoSelection = function(){
        this._clearAllExtracted();
        
        if(_iTotalNum === 0){
            return;
        }
        var iNum = _aListSelected.pop();
        _iTotalNum--;
        _aNumSelected[iNum] = false;
        _aCell[iNum].setActive(false);
        for(var i=0; i<_aNumSelected.length; i++){
            _aCell[i].block(false);
        }
        this._checkActiveButton();
        _oPayoutsTable.updatePayouts(_iTotalNum-1);
    };
    
    this.selectBet = function(szType){
        this._clearAllExtracted();
        
        var iIndex;
        for(var i=0; i<settings.BET.length; i++){
            if(settings.BET[i] === _iCurBet){
                iIndex = i;
            }
        }
        
        if(szType === "add"){
            if(iIndex !== settings.BET.length-1 && settings.BET[iIndex +1] <= _iCurPlayerMoney){
                iIndex++;
            }
        } else {
            if(iIndex !== 0){
                iIndex--;
            }
        }
        
        _iCurBet = settings.BET[iIndex];
        _oInterface.refreshBet(_iCurBet);
        this._checkActiveButton();
        
    };
   
    this.play5 = function(){
        _iCountPlays = 5;
        this.play();        
    };
    
    this.tryShowAd = function(){
        _iAdCounter++;
        if(_iAdCounter === AD_SHOW_COUNTER){
            _iAdCounter = 0;
            $(mainInstance()).trigger("show_interlevel_ad");
        }
    };
   
    this.play = function(){
        //Detect max prize to win
        this._clearAllExtracted();

        if(_iTotalNum < 2){
            return;
        }
        
        this.smartBlockGUI(false);
        _iCurPlayerMoney -= _iCurBet;
        _iBank += _iCurBet;
        _iCurPlayerMoney = parseFloat(_iCurPlayerMoney.toFixed(1));          
        _oInterface.refreshMoney(_iCurPlayerMoney);
        
        var iWinIndex = null;
        for(let i = 0; i < settings.getPayOuts()[_iTotalNum-1].pays.length; i += 1){
            var iTotalWin = settings.getPayOuts()[_iTotalNum-1].pays[i] * _iCurBet;
            if(iTotalWin <= _iBank){
                iWinIndex = i;
                break;
            }
        }

        if(iWinIndex === null){
            this._extractLosingCombination();
        } else {
            this._checkWin(iWinIndex);
        }   
        
        $(mainInstance()).trigger("bet_placed",{tot_bet:_iCurBet,money:_iCurPlayerMoney,num_selected:_iTotalNum});
    };
   
    this._checkWin = function(iMaxWinIndex){
        var iRandWin = Math.random()*100;
        if(iRandWin < this.state.win_occurrence[_iTotalNum-1]){
            
            this._extractWinCombination(iMaxWinIndex);
            
        } else {
            this._extractLosingCombination();
        }        
    };
   
    this._extractWinCombination = function(iMaxWinIndex){
        
        _bWin = true;
        
        var aWinOccurrenceList = [];
        for(let i = settings.getPayOuts()[_iTotalNum-1].pays.length-1; i >= iMaxWinIndex; i -= 1){
            for(let j = 0; j < settings.getPayOuts()[_iTotalNum-1].occurrence[i]; j += 1){
                aWinOccurrenceList.push(settings.getPayOuts()[_iTotalNum-1].hits[i]);
            }
        }
        
        var iRandWinIndex = Math.floor(Math.random()*aWinOccurrenceList.length);
        
        //Copy win numbers
        var aWinTempList = [];
        for(let i=0; i<_aListSelected.length; i++){
            aWinTempList[i] = _aListSelected[i]+1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        var aLoseTempList = [];
        for(let i=0; i<_aNumSelected.length; i++){
            if(!_aNumSelected[i]){
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for(let i=0; i<20; i++){
            if(i<aWinOccurrenceList[iRandWinIndex]){
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);       
        //_oPayoutsTable.highlightWin(aWinOccurrenceList[iRandWinIndex])
        for(let i=0; i<20; i++){
            //_aCell[_aCombination[i]-1].setExtracted(true);           
        }  
        
        _iHitsNumber = aWinOccurrenceList[iRandWinIndex];
        this._animExtraction();
        
    };
   
    this._extractLosingCombination = function(){
        
        _bWin = false;
        
        var iMaxFakeWinNumber = (settings.getPayOuts()[_iTotalNum-1].hits[settings.getPayOuts()[_iTotalNum-1].hits.length-1]) -1;
        
        var iWinNumberToExtract = Math.round(Math.random()*iMaxFakeWinNumber);
        //Copy win numbers
        var aWinTempList = [];
        for(var i=0; i<_aListSelected.length; i++){
            aWinTempList[i] = _aListSelected[i]+1;
        }        
        shuffle(aWinTempList);
        
        //Copy lose numbers
        var aLoseTempList = [];
        for(let i=0; i<_aNumSelected.length; i++){
            if(!_aNumSelected[i]){
                aLoseTempList.push(i+1);
            }
        }
        shuffle(aLoseTempList);
        
        //Extract combination
        _aCombination = [];
        for(let i=0; i<20; i++){
            if(i<iWinNumberToExtract){
                _aCombination.push(aWinTempList[i]);
            } else {
                _aCombination.push(aLoseTempList[i]);
            }            
        }        
        shuffle(_aCombination);
        
        _iHitsNumber = 0;
        this._animExtraction();
    };
    
    this._animExtraction = function(){        
        //Calculate ball final position
        const aBallPos = [];
        for(let i = 0; i < 20; i += 1){
            aBallPos.push(_aCell[ (_aCombination[i] -1) ].getGlobalPosition())
        }

        _oAnimBalls.startAnimation(aBallPos);        
    };
   
    this._checkContinueGame = function(){        
        //Update Money
        for(let i = 0; i < settings.getPayOuts()[_iTotalNum-1].hits.length; i += 1){
            if(settings.getPayOuts()[_iTotalNum-1].hits[i] === _iHitsNumber){
                var iTotalWin = (_iCurBet*settings.getPayOuts()[_iTotalNum-1].pays[i]);
                iTotalWin = parseFloat(iTotalWin.toFixed(1));
                _iCurPlayerMoney += iTotalWin;
                _iBank -= iTotalWin;
                _oPayoutsTable.showWin(iTotalWin);
                _oPayoutsTable.highlightWin(_iHitsNumber);
				
                break;
            }
        }        
        _oInterface.refreshMoney(_iCurPlayerMoney);
        
        if(_bWin){
            
            playSound("win",1,false);
            
        }
        //trace("_iCurPlayerMoney: "+_iCurPlayerMoney);
		//trace("_iBank: "+_iBank);
        
        _oAnimBalls.resetBalls();
        this.highlightCell();
        
        //////CHECK IF CAN CONTINUE GAME////
        
        $(mainInstance()).trigger("save_score",_iCurPlayerMoney);
        if(_iCurBet>_iCurPlayerMoney){
            
            var iNewIndex = null;
            for(let i=0; i<settings.BET.length; i++){
                if(settings.BET[i]<=_iCurPlayerMoney){
                    iNewIndex = i;                    
                }
            }
            if(iNewIndex !== null){
                _iCurBet = settings.BET[iNewIndex];
                _oInterface.refreshBet(_iCurBet);
            } else {
                //END GAME
                this.gameOver();
                return;
            }        
            
        }
        
        if(_iCountPlays === 1){
            this.smartBlockGUI(true);
            return;
        } else {
            _iCountPlays--;
            setTimeout(function(){ _oParent.play(); }, 2000);
            
        }
        
        
        /////////////////////////////////////
    };
   
    this.showExtracted = function(iIndex, iColor){
        _aCell[_aCombination[iIndex]-1].setExtracted(true,iColor);
    };
   
    this._clearAllExtracted = function(){
        //createjs.Tween.removeAllTweens();
        _oPayoutsTable.showWin(0);
        _oPayoutsTable.stopHighlight();
        for(var i=0; i<_aNumSelected.length; i++){
            _aCell[i].setExtracted(false,0);
        }
        
        for(var j=0; j<_aListSelected.length; j++){ 
            _aCell[_aListSelected[j]].setActive(true);          
        }       
    };
    
    this._clearAllSelected = function(){
        //createjs.Tween.removeAllTweens();
        _oPayoutsTable.showWin(0);
        _oPayoutsTable.stopHighlight();
        for(var i=0; i<_aNumSelected.length; i++){
            _aCell[i].setExtracted(false,0);
        }       
    };
    
    this.smartBlockGUI = function(bVal){
        this.tryShowAd();
        
        if(bVal){
            _oBlockScreen.visible = false;
            _oInterface.enableAllButton(true);
            
            if(_iCurBet*5 <= _iCurPlayerMoney ){
                _oInterface.enablePlay5(true);
            } else {
                _oInterface.enablePlay5(false);
            }
            
        } else {
            _oBlockScreen.visible = true;
            _oInterface.enableAllButton(false);
        }
    };
    
    this.getCurMoney = function(){
        return _iCurPlayerMoney;
    };
       
    
    this.unload = function(){
        // _bInitGame = false;
        _oInterface.unload();
        if(_oEndPanel !== null){
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
    
    this.gameOver = function(){  
        _oEndPanel = CEndPanel(CSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show();
    };

    this.highlightCell = function(){
        
        for(var i=0; i<_aCombination.length; i++){
            for(var j=0; j<_aListSelected.length; j++){
                if(_aCombination[i] === _aListSelected[j]+1){
                    _aCell[_aListSelected[j]].highlight();
                }                
            }           
        }
    };

    this.update = function(){
        
    };
    
    // WIN_OCCURRENCE = oData.win_occurrence;
    settings.setPayOuts(oData.payouts)
    settings.BANK = oData.bank_money;
    settings.START_PLAYER_MONEY = oData.start_player_money;
    settings.ANIMATION_SPEED = oData.animation_speed;
    
    AD_SHOW_COUNTER = oData.ad_show_counter;
    
    _oParent=this;
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

