// import $ from 'jquery'
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function CSpriteLibrary() {
    this._oLibSprites = {};
    let _iNumSprites = 0;
    let _iCntSprites = 0;
    var _cbCompleted;
    var _cbTotalCompleted;
    var _cbOwner;
    
    this.init = function(cbCompleted, cbTotalCompleted, cbOwner) {
        // _iNumSprites = 0;
        // _iCntSprites = 0;
        _cbCompleted = cbCompleted;
        _cbTotalCompleted = cbTotalCompleted;
        _cbOwner     = cbOwner;
    }
    
    this.addSprite = function(szKey, szPath){
        if (!this._oLibSprites.hasOwnProperty(szKey)){
            this._oLibSprites[szKey] = { szPath:szPath, oSprite: new Image() };
            _iNumSprites++;
        }
    }
    
    this.getSprite = function(szKey) {
        if (!this._oLibSprites.hasOwnProperty(szKey)){
            return null;
        }else{
            return this._oLibSprites[szKey].oSprite;
        }
    }
    
    this._onSpritesLoaded = function(){
        _cbTotalCompleted.call(_cbOwner);
    }
      
    this._onSpriteLoaded = function(){
        _cbCompleted.call(_cbOwner);
        if (++_iCntSprites === _iNumSprites) {
            this._onSpritesLoaded();
        }
    }    

    this.loadSprites = function () {
        for (var szKey in this._oLibSprites) {
            this._oLibSprites[szKey].oSprite["oSpriteLibrary"] = this;
            this._oLibSprites[szKey].oSprite.onload = function() {
                this.oSpriteLibrary._onSpriteLoaded();
            };
            this._oLibSprites[szKey].oSprite.src = this._oLibSprites[szKey].szPath;
        } 
    }
    
    this.getNumSprites=function () {
        return _iNumSprites;
    }
}

const Singleton = (() => {
    let instance;
  
    function createInstance() {
        return new CSpriteLibrary();
    }
  
    return {
      getInstance() {

        if (!instance) {
          instance = createInstance();
        }
        return instance;
      },
    };
})();

export default Singleton.getInstance();
// export default CSpriteLibrary;
