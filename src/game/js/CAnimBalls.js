import createjs from './createjs.js'

import {
    createSprite,
    playSound,
} from './ctl_utils.js'
import settings from './settings.js'
import CSpriteLibrary from './sprite_lib'
import {
    mainInstance,
} from './CMain.js'
import {
    gameInstance
} from './CGame.js'

function CAnimBalls(iX, iY) {
    
    var _iTimeAnim;
    var _iOffset;
    var _iLastBall;
    
    var _aBall;
    var _aBallPos;
    var _aBallGlassPos;
    
    // var _oParent;
    
    this.initAnimalBalls = function(iX, iY) {
        
        _iTimeAnim = settings.ANIMATION_SPEED;
        _iLastBall = 7;
        
        const ballSprite = CSpriteLibrary.getSprite('ball');
        const oSpriteSheet = new createjs.SpriteSheet({   
            images: [ballSprite], 
            // width, height & registration point of each sprite
            frames: {
                width: ballSprite.width / settings.NUM_DIFFERENT_BALLS,
                height: ballSprite.height,
                regX: (ballSprite.width / settings.NUM_DIFFERENT_BALLS) / 2,
                regY: ballSprite.height / 2
            }, 
            animations: {
                red: [0],
                green: [1],
                cyan: [0],
                violet: [1],
                blue: [1]
            }
       });         
        
        _aBall = [];
        _aBallGlassPos = [];
        _iOffset = oSpriteSheet.height;
        
        for(let i = 0; i < 28; i += 1){
            const iRandomColor = Math.floor(Math.random()*settings.NUM_DIFFERENT_BALLS);
            _aBall[i] = createSprite(oSpriteSheet,
                iRandomColor,
                (oSpriteSheet.width / settings.NUM_DIFFERENT_BALLS) / 2,
                oSpriteSheet.height / 2,
                oSpriteSheet.width / settings.NUM_DIFFERENT_BALLS,
                oSpriteSheet.height);
            _aBall[i].gotoAndStop(iRandomColor);

            _aBall[i].x = iX;
            
            if(i>_iLastBall){
                _aBall[i].alpha = 0;
                _aBall[i].scaleX = _aBall[i].scaleY = 0;
                _aBall[i].y = iY + (_iLastBall)*_iOffset;
            } else {
                _aBall[i].y = iY + i*_iOffset;
                _aBallGlassPos[i] = iY + i*_iOffset;
            }
        }
        
        for(let i=0; i<28; i++){
            mainInstance().getStage().addChild(_aBall[28-i-1]);
        }
        
        //this.startAnim(0);
        //this.startAnimation();
    };
    
    this.unload = function() {
        for(let i = 0; i < 26; i += 1) {
            mainInstance().getStage().removeChild(_aBall[i]);
        }
    };
    
    this.startAnimation = function(aBallPosition) {
        _aBallPos = [];
        for(let i = 0; i < 20; i += 1) {
            _aBallPos[i] = aBallPosition[i];
        }
        this._animBalls(0);
    };
    
    this._animBalls = (iCurBall) => {
        playSound('launch_ball', 1, false);
        
        createjs.Tween.get(_aBall[iCurBall]).to({y: -200}, _iTimeAnim * 2, createjs.Ease.quartOut).to({y: _aBallPos[iCurBall].y}, _iTimeAnim*3,createjs.Ease.bounceOut).call(function(){
            gameInstance().showExtracted(iCurBall, _aBall[iCurBall].currentFrame);
            _aBall[iCurBall].visible = false;
            if(iCurBall < 19){                
            } else {
                gameInstance()._checkContinueGame();
            }
        });       
        createjs.Tween.get(_aBall[iCurBall]).to({x: _aBallPos[iCurBall].x}, _iTimeAnim*5);
        
        var iCont = 0;
        for(let i = iCurBall + 1; i < iCurBall + _iLastBall + 1; i += 1) {
            createjs.Tween.get(_aBall[i]).to({y: _aBallGlassPos[iCont]}, _iTimeAnim); 
            iCont++;
        };
        
        createjs.Tween
            .get(_aBall[iCurBall + _iLastBall + 1])
            .to({ scaleX: 1, scaleY :1, alpha:1 },
            _iTimeAnim, createjs.Ease.cubicIn).call(() => {
                if(iCurBall < 19) {
                    // self call
                    this._animBalls(iCurBall+1);
                }
            });
    };
    
    this.resetBalls = function() {
        let iRandomColor
        for(let i = 0; i < 28; i += 1 ) {
            _aBall[i].visible = true;
            _aBall[i].x = iX;
            if(i <= _iLastBall) {
                _aBall[i].y = iY + i*_iOffset;
                _aBall[i].gotoAndStop(_aBall[20+i].currentFrame);
                
            } else if(i > _iLastBall) {
                iRandomColor = Math.floor(Math.random()*settings.NUM_DIFFERENT_BALLS);
                _aBall[i].gotoAndStop(iRandomColor);
                _aBall[i].alpha = 0;
                _aBall[i].scaleX = _aBall[i].scaleY = 0;
                _aBall[i].y = iY + (_iLastBall)*_iOffset;
            } else {
                iRandomColor = Math.floor(Math.random()*settings.NUM_DIFFERENT_BALLS);
                _aBall[i].gotoAndStop(iRandomColor);
                _aBall[i].y = iY + (i *_iOffset);
            }
            
            createjs.Tween.removeTweens(_aBall[i]);
        }
    };
    
    // _oParent = this;
    this.initAnimalBalls(iX, iY);
} 

export default CAnimBalls;
