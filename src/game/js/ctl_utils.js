import $ from 'jquery'

import createjs from './createjs.js'
import screenfull from './screenfull.js'
import settings from './settings.js'

import { 
    menuInstance
} from './CMenu.js'
import {
    interfaceInstance
} from './CInterface.js'
import {
    mainInstance,
} from './CMain.js'

var s_iScaleFactor = 1;
var s_iOffsetX;
var s_iOffsetY;
// var s_bIsIphone = false;


$(window).resize(function() {
	sizeHandler();
});

// function trace(szMsg){
//     console.log(szMsg);
// }

function getSize(Name) {
    var size;
    var name = Name.toLowerCase();
    var document = window.document;
    var documentElement = document.documentElement;
    if (window["inner" + Name] === undefined) {
            // IE6 & IE7 don't have window.innerWidth or innerHeight
            size = documentElement["client" + Name];
    } else if (window["inner" + Name] !== documentElement["client" + Name]) {
        // WebKit doesn't include scrollbars while calculating viewport size so we have to get fancy

        // Insert markup to test if a media query will match document.doumentElement["client" + Name]
        var bodyElement = document.createElement("body");
        bodyElement.id = "vpw-test-b";
        bodyElement.style.cssText = "overflow:scroll";
        var divElement = document.createElement("div");
        divElement.id = "vpw-test-d";
        divElement.style.cssText = "position:absolute;top:-1000px";
        // Getting specific on the CSS selector so it won't get overridden easily
        divElement.innerHTML = "<style>@media(" + name + ":" + documentElement["client" + Name] + "px){body#vpw-test-b div#vpw-test-d{" + name + ":7px!important}}</style>";
        bodyElement.appendChild(divElement);
        documentElement.insertBefore(bodyElement, document.head);

        if (divElement["offset" + Name] === 7) {
            // Media query matches document.documentElement["client" + Name]
            size = documentElement["client" + Name];
        } else {
            // Media query didn't match, use window["inner" + Name]
            size = window["inner" + Name];
        }
        // Cleanup
        documentElement.removeChild(bodyElement);
    }
    else {
            // Default to use window["inner" + Name]
            size = window["inner" + Name];
    }
    return size;
};

window.addEventListener("orientationchange", onOrientationChange );

function onOrientationChange() {
    if (window.matchMedia("(orientation: portrait)").matches) {
       // you're in PORTRAIT mode	   
	   sizeHandler();
    }

    if (window.matchMedia("(orientation: landscape)").matches) {
       // you're in LANDSCAPE mode   
	   sizeHandler();
    }
}

function isChrome() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    return isChrome;
}

function isIOS() {
   const iDevices = [
       'iPad Simulator',
       'iPhone Simulator',
       'iPod Simulator',
       'iPad',
       'iPhone',
       'iPod' 
   ]; 

//    var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

   if (navigator.userAgent.toLowerCase().indexOf("iphone") !== -1) {
    //    s_bIsIphone = true;
       return true
   }
           
   while (iDevices.length) {
       if (navigator.platform === iDevices.pop()) {
           return true; 
       } 
   } 
//    s_bIsIphone = false;

   return false; 
}


function getIOSWindowHeight() {
    // Get zoom level of mobile Safari
    // Note, that such zoom detection might not work correctly in other browsers
    // We use width, instead of height, because there are no vertical toolbars :)
    var zoomLevel = document.documentElement.clientWidth / window.innerWidth;

    // window.innerHeight returns height of the visible area. 
    // We multiply it by zoom and get out real height.
    return window.innerHeight * zoomLevel;
};

// You can also get height of the toolbars that are currently displayed
// function getHeightOfIOSToolbars() {
//     var tH = (window.orientation === 0 ? window.height : window.screen.width) -  getIOSWindowHeight();
//     return tH > 1 ? tH : 0;
// };

//THIS FUNCTION MANAGES THE CANVAS SCALING TO FIT PROPORTIONALLY THE GAME TO THE CURRENT DEVICE RESOLUTION

function sizeHandler() {
    window.scrollTo(0, 1);
    
	if (!$("#canvas")) {
		return;
	}

	var h;
    // var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
    if (isIOS()) {
        h = getIOSWindowHeight();
    } else { 
        h = getSize("Height");
    }
    
    var w = getSize("Width");
    
    _checkOrientation(w,h);
        
	var multiplier = Math.min((h / settings.CANVAS_HEIGHT), (w / settings.CANVAS_WIDTH));

	var destW = settings.CANVAS_WIDTH * multiplier;
	var destH = settings.CANVAS_HEIGHT * multiplier;
        
    var iAdd = 0;
    if (destH < h) {
        iAdd = h-destH;
        destH += iAdd;
        destW += iAdd*(settings.CANVAS_WIDTH / settings.CANVAS_HEIGHT);
    } else  if (destW < w) {
        iAdd = w-destW;
        destW += iAdd;
        destH += iAdd*(settings.CANVAS_HEIGHT / settings.CANVAS_WIDTH);
    }

    var fOffsetY = ((h / 2) - (destH / 2));
    var fOffsetX = ((w / 2) - (destW / 2));
    var fGameInverseScaling = (settings.CANVAS_WIDTH / destW);

    if (fOffsetX*fGameInverseScaling < - settings.EDGEBOARD_X ||  
        fOffsetY*fGameInverseScaling < - settings.EDGEBOARD_Y) {
        multiplier = Math.min( h / ( settings.CANVAS_HEIGHT-(settings.EDGEBOARD_Y*2)), w / (settings.CANVAS_WIDTH-(settings.EDGEBOARD_X*2)));
        destW = settings.CANVAS_WIDTH * multiplier;
        destH = settings.CANVAS_HEIGHT * multiplier;
        fOffsetY = ( h - destH ) / 2;
        fOffsetX = ( w - destW ) / 2;
        
        fGameInverseScaling = (settings.CANVAS_WIDTH/destW);
    }

    s_iOffsetX = (-1 * fOffsetX * fGameInverseScaling);
    s_iOffsetY = (-1 * fOffsetY * fGameInverseScaling);
    
    if (fOffsetY >= 0) {
        s_iOffsetY = 0;
    }
        
    if (fOffsetX >= 0) {
        s_iOffsetX = 0;
    }
    
    if (interfaceInstance() !== null) {
        interfaceInstance().refreshButtonPos( s_iOffsetX,s_iOffsetY);
    }
    
    // TODO (jiwoniy)
    // if (CMenu() !== null){
    //     CMenu().refreshButtonPos( s_iOffsetX,s_iOffsetY);
    // }
        
    if (isIOS()) {
        const canvas = document.getElementById('canvas');
        mainInstance().getStage().canvas.width = destW * 2;
        mainInstance().getStage().canvas.height = destH * 2;
        canvas.style.width = destW+"px";
        canvas.style.height = destH+"px";
        var iScale = Math.min(destW / settings.CANVAS_WIDTH, destH / settings.CANVAS_HEIGHT);
        s_iScaleFactor = iScale * 2;
        mainInstance().getStage().scaleX = mainInstance().getStage().scaleY = s_iScaleFactor;  
    } else if($.browser.mobile || isChrome()) {
        $("#canvas").css("width",destW+"px");
        $("#canvas").css("height",destH+"px");
    } else{
        mainInstance().getStage().canvas.width = destW;
        mainInstance().getStage().canvas.height = destH;

        s_iScaleFactor = Math.min(destW / settings.CANVAS_WIDTH, destH / settings.CANVAS_HEIGHT);
        mainInstance().getStage().scaleX = mainInstance().getStage().scaleY = s_iScaleFactor; 
    }
        
        
    if(fOffsetY < 0){
        $("#canvas").css("top",fOffsetY+"px");
    }else{
        $("#canvas").css("top","0px");
    }
    
    $("#canvas").css("left",fOffsetX+"px");
    fullscreenHandler();
};

function _checkOrientation(width, height) {
    if ($.browser.mobile && settings.ENABLE_CHECK_ORIENTATION) {
        if (width > height) {
            if ($(".orientation-msg-container").attr("data-orientation") === "landscape") {
                $(".orientation-msg-container").css("display","none");
                mainInstance().startUpdate();
            } else {
                $(".orientation-msg-container").css("display","block");
                mainInstance().stopUpdate();
            }  
        }else{
            if ($(".orientation-msg-container").attr("data-orientation") === "portrait") {
                $(".orientation-msg-container").css("display","none");
                mainInstance().startUpdate();
            } else {
                $(".orientation-msg-container").css("display","block");
                mainInstance().stopUpdate();
            }   
        }
    }
}

function playSound(szSound, iVolume, bLoop) {
    if(settings.DISABLE_SOUND_MOBILE === false || $.browser.mobile === false) {
        mainInstance().getSounds()[szSound].play();
        mainInstance().getSounds()[szSound].volume(iVolume);

        mainInstance().getSounds()[szSound].loop(bLoop);

        return mainInstance().getSounds()[szSound];
    }
    return null;
}

// function stopSound(szSound){
//     if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
//         s_aSounds[szSound].stop();
//     }
// }   

// function setVolume(szSound, iVolume){
//     if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
//         s_aSounds[szSound].volume(iVolume);
//     }
// }  

// function setMute(szSound, bMute){
//     if(settings.DISABLE_SOUND_MOBILE === false || s_bMobile === false){
//         s_aSounds[szSound].mute(bMute);
//     }
// }

function createBitmap(oSprite, iWidth, iHeight){
	const oBmp = new createjs.Bitmap(oSprite);
    const hitObject = new createjs.Shape();

	if (iWidth && iHeight) {
		hitObject.graphics.beginFill("#fff").drawRect(0, 0, iWidth, iHeight);
	} else {
		hitObject.graphics.beginFill("#ff0").drawRect(0, 0, oSprite.width, oSprite.height);
	}

	oBmp.hitArea = hitObject;

	return oBmp;
}

function createSprite(oSpriteSheet, szState, iRegX, iRegY, iWidth, iHeight) {
    let oRetSprite = null
	if (szState !== null) {
		oRetSprite = new createjs.Sprite(oSpriteSheet, szState);
	} else {
		oRetSprite = new createjs.Sprite(oSpriteSheet);
	}
	
	const hitObject = new createjs.Shape();
	hitObject.graphics.beginFill("#000000").drawRect(-iRegX, -iRegY, iWidth, iHeight);

	oRetSprite.hitArea = hitObject;
	
	return oRetSprite;
}

// function pad(n, width, z) {
//     z = z || '0';
//     n = n + '';
//     return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
// }

// function randomFloatBetween(minValue,maxValue,precision){
//     if(typeof(precision) === 'undefined'){
//         precision = 2;
//     }
//     return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
// }

// function rotateVector2D( iAngle, v) { 
// 	var iX = v.getX() * Math.cos( iAngle ) + v.getY() * Math.sin( iAngle );
// 	var iY = v.getX() * (-Math.sin( iAngle )) + v.getY() * Math.cos( iAngle ); 
// 	v.set( iX, iY );
// }

// function tweenVectorsOnX( vStart, vEnd, iLerp ){
//     var iNewX = vStart + iLerp *( vEnd-vStart);
//     return iNewX;
// }

function shuffle(array) {
  let currentIndex = array.length
  let temporaryValue = null
  let randomIndex = null

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// function bubbleSort(a)
// {
//     var swapped;
//     do {
//         swapped = false;
//         for (var i=0; i < a.length-1; i++) {
//             if (a[i] > a[i+1]) {
//                 var temp = a[i];
//                 a[i] = a[i+1];
//                 a[i+1] = temp;
//                 swapped = true;
//             }
//         }
//     } while (swapped);
// }

// function compare(a,b) {
//   if (a.index > b.index)
//      return -1;
//   if (a.index < b.index)
//     return 1;
//   return 0;
// }

//----------------------
		// Linear	
		/**
		 * Interpolates a value between b and c parameters
		 * <p></br><b>Note:</b></br>
		 * &nbsp&nbsp&nbspt and d parameters can be in frames or seconds/milliseconds
		 *
		 * @param t Elapsed time
		 * @param b Initial position
		 * @param c Final position
		 * @param d Duration
		 * @return A value between b and c parameters
		 */

// function easeLinear (t, b, c, d) {
// 	return c*t/d + b;
// }

//----------------------
		// Quad		
		/**
		 * Interpolates a value between b and c parameters
		 * <p></br><b>Note:</b></br>
		 * &nbsp&nbsp&nbspt and d parameters can be in frames or seconds/milliseconds
		 *
		 * @param t Elapsed time
		 * @param b Initial position
		 * @param c Final position
		 * @param d Duration
		 * @return A value between b and c parameters
		 */	

// function easeInQuad (t, b, c, d) {
//     return c*(t/=d)*t + b;
// }
//----------------------
		// Sine	
		/**
		 * Interpolates a value between b and c parameters
		 * <p></br><b>Note:</b></br>
		 * &nbsp&nbsp&nbspt and d parameters can be in frames or seconds/milliseconds
		 *
		 * @param t Elapsed time
		 * @param b Initial position
		 * @param c Final position
		 * @param d Duration
		 * @return A value between b and c parameters
		 */	                
                
// function easeInSine (t, b, c, d) {
//     return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
// }          
                
// function easeInCubic (t, b, c, d) {
//     return c*(t/=d)*t*t + b;
// };                


// function getTrajectoryPoint(t,p){
//     var result = new createjs.Point();
//     var oneMinusTSq = (1-t) * (1-t);
//     var TSq = t*t;
//     result.x = oneMinusTSq*p.start.x+2*(1-t)*t*p.traj.x+TSq*p.end.x;
//     result.y = oneMinusTSq*p.start.y+2*(1-t)*t*p.traj.y+TSq*p.end.y;
//     return result;
// }

// function formatTime(iTime) {	
//     iTime/=1000;
//     var iMins = Math.floor(iTime/60);
//     var iSecs = iTime-(iMins*60);
//     iSecs = parseFloat(iSecs).toFixed(1)
    
//     var szRet = "";

//     if ( iMins < 10 ){
//         szRet += "0" + iMins + ":";
//     } else {
//         szRet += iMins + ":";
//     }

//     if ( iSecs < 10 ){
//         szRet += "0" + iSecs;
//     } else {
//         szRet += iSecs;
//     }	

//     return szRet;
// }

// function degreesToRadians(iAngle) {
//     return iAngle * Math.PI / 180;
// }

// function checkRectCollision(bitmap1,bitmap2) {
//     var b1, b2;
//     b1 = getBounds(bitmap1,0.9);
//     b2 = getBounds(bitmap2,0.98);
//     return calculateIntersection(b1,b2);
// }

// function calculateIntersection(rect1, rect2) {
//     // first we have to calculate the
//     // center of each rectangle and half of
//     // width and height
//     var dx, dy, r1={}, r2={};
//     r1.cx = rect1.x + (r1.hw = (rect1.width /2));
//     r1.cy = rect1.y + (r1.hh = (rect1.height/2));
//     r2.cx = rect2.x + (r2.hw = (rect2.width /2));
//     r2.cy = rect2.y + (r2.hh = (rect2.height/2));

//     dx = Math.abs(r1.cx-r2.cx) - (r1.hw + r2.hw);
//     dy = Math.abs(r1.cy-r2.cy) - (r1.hh + r2.hh);

//     if (dx < 0 && dy < 0) {
//       dx = Math.min(Math.min(rect1.width,rect2.width),-dx);
//       dy = Math.min(Math.min(rect1.height,rect2.height),-dy);
//       return {x:Math.max(rect1.x,rect2.x),
//               y:Math.max(rect1.y,rect2.y),
//               width:dx,
//               height:dy,
//               rect1: rect1,
//               rect2: rect2};
//     } else {
//       return null;
//     }
// }

// function getBounds(obj,iTolerance) {
//     var bounds={x:Infinity,y:Infinity,width:0,height:0};
//     if ( obj instanceof createjs.Container ) {
//       bounds.x2 = -Infinity;
//       bounds.y2 = -Infinity;
//       var children = obj.children, l=children.length, cbounds, c;
//       for ( c = 0; c < l; c++ ) {
//         cbounds = getBounds(children[c],1);
//         if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
//         if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
//         if ( cbounds.x + cbounds.width > bounds.x2 ) bounds.x2 = cbounds.x + cbounds.width;
//         if ( cbounds.y + cbounds.height > bounds.y2 ) bounds.y2 = cbounds.y + cbounds.height;
//         //if ( cbounds.x - bounds.x + cbounds.width  > bounds.width  ) bounds.width  = cbounds.x - bounds.x + cbounds.width;
//         //if ( cbounds.y - bounds.y + cbounds.height > bounds.height ) bounds.height = cbounds.y - bounds.y + cbounds.height;
//       }
//       if ( bounds.x === Infinity ) bounds.x = 0;
//       if ( bounds.y === Infinity ) bounds.y = 0;
//       if ( bounds.x2 === Infinity ) bounds.x2 = 0;
//       if ( bounds.y2 === Infinity ) bounds.y2 = 0;
      
//       bounds.width = bounds.x2 - bounds.x;
//       bounds.height = bounds.y2 - bounds.y;
//       delete bounds.x2;
//       delete bounds.y2;
//     } else {
//       var gp,gp2,gp3,gp4,imgr={},sr;
//       if ( obj instanceof createjs.Bitmap ) {
//         sr = obj.sourceRect || obj.image;

//         imgr.width = sr.width * iTolerance;
//         imgr.height = sr.height * iTolerance;
//       } else if ( obj instanceof createjs.Sprite ) {
//         if ( obj.spriteSheet._frames && obj.spriteSheet._frames[obj.currentFrame] && obj.spriteSheet._frames[obj.currentFrame].image ) {
//           var cframe = obj.spriteSheet.getFrame(obj.currentFrame);
//           imgr.width =  cframe.rect.width;
//           imgr.height =  cframe.rect.height;
//           imgr.regX = cframe.regX;
//           imgr.regY = cframe.regY;
//         } else {
//           bounds.x = obj.x || 0;
//           bounds.y = obj.y || 0;
//         }
//       } else {
//         bounds.x = obj.x || 0;
//         bounds.y = obj.y || 0;
//       }

//       imgr.regX = imgr.regX || 0; imgr.width  = imgr.width  || 0;
//       imgr.regY = imgr.regY || 0; imgr.height = imgr.height || 0;
//       bounds.regX = imgr.regX;
//       bounds.regY = imgr.regY;
      
//       gp  = obj.localToGlobal(0         -imgr.regX,0          -imgr.regY);
//       gp2 = obj.localToGlobal(imgr.width-imgr.regX,imgr.height-imgr.regY);
//       gp3 = obj.localToGlobal(imgr.width-imgr.regX,0          -imgr.regY);
//       gp4 = obj.localToGlobal(0         -imgr.regX,imgr.height-imgr.regY);

//       bounds.x = Math.min(Math.min(Math.min(gp.x,gp2.x),gp3.x),gp4.x);
//       bounds.y = Math.min(Math.min(Math.min(gp.y,gp2.y),gp3.y),gp4.y);
//       bounds.width = Math.max(Math.max(Math.max(gp.x,gp2.x),gp3.x),gp4.x) - bounds.x;
//       bounds.height = Math.max(Math.max(Math.max(gp.y,gp2.y),gp3.y),gp4.y) - bounds.y;
//     }
//     return bounds;
// }

function NoClickDelay(el) {
	this.element = el;
	if( window.Touch ) this.element.addEventListener('touchstart', this, false);
}

//Fisher-Yates Shuffle
// function shuffle(array) {
//         var counter = array.length, temp, index;
//         // While there are elements in the array
//         while (counter > 0) {
//             // Pick a random index
//             index = Math.floor(Math.random() * counter);
//             // Decrease counter by 1
//             counter--;
//             // And swap the last element with it
//             temp = array[counter];
//             array[counter] = array[index];
//             array[index] = temp;
//         }
//         return array;
// }

NoClickDelay.prototype = {
    handleEvent: function(e) {
        switch(e.type) {
            case 'touchstart':
                this.onTouchStart(e);
                break;
            case 'touchmove':
                this.onTouchMove(e);
                break;
            case 'touchend':
                this.onTouchEnd(e);
                break;
            default:
                break
        }
},
	
onTouchStart: function(e) {
    e.preventDefault();
    this.moved = false;
    
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
},
	
onTouchMove: function(e) {
    this.moved = true;
},
	
onTouchEnd: function(e) {
    this.element.removeEventListener('touchmove', this, false);
    this.element.removeEventListener('touchend', this, false);
    
    if( !this.moved ) {
        var theTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        if(theTarget.nodeType === 3) theTarget = theTarget.parentNode;
        
        var theEvent = document.createEvent('MouseEvents');
        theEvent.initEvent('click', true, true);
        theTarget.dispatchEvent(theEvent);
    }
}

};

(function() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document) {
        document.addEventListener("visibilitychange", onchange);
    } else if ((hidden = "mozHidden") in document) {
        document.addEventListener("mozvisibilitychange", onchange);
    } else if ((hidden = "webkitHidden") in document) {
        document.addEventListener("webkitvisibilitychange", onchange);
    } else if ((hidden = "msHidden") in document) {
        document.addEventListener("msvisibilitychange", onchange);
    }  else if ('onfocusin' in document) {
        // IE 9 and lower:
        document.onfocusin = document.onfocusout = onchange;
    } else {
        // All others:
        window.onpageshow = window.onpagehide 
            = window.onfocus = window.onblur = onchange;
    }        

    function onchange (evt) {
        var v = 'visible', h = 'hidden',
            evtMap = { 
                focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h 
            };

        evt = evt || window.event;
		
        if (evt.type in evtMap){
            document.body.className = evtMap[evt.type];
        }else{        
            document.body.className = this[hidden] ? "hidden" : "visible";

			if(document.body.className === "hidden"){
				mainInstance().stopUpdate();
			}else{
				mainInstance().startUpdate();
			}
		}
    }
})();

// function ctlArcadeResume(){
//     if(mainInstance() !== null){
//         mainInstance().startUpdate();
//     }
// }

// function ctlArcadePause(){
//     if(mainInstance() !== null){
//         mainInstance().stopUpdate();
//     }
// }

function getParamValue(paramName){
        var url = window.location.search.substring(1);
        var qArray = url.split('&'); 
        for (let i = 0; i < qArray.length; i += 1) 
        {
                var pArr = qArray[i].split('=');
                if (pArr[0] === paramName) 
                        return pArr[1];
        }
}

function fullscreenHandler(){
    const screen = window.screen;

    if (!settings.ENABLE_FULLSCREEN || !screenfull.enabled){
       return;
    }
	
    if(screen.height < window.innerHeight+3 && screen.height > window.innerHeight-3){
        mainInstance().setFullScreen(true)
        // s_bFullscreen = true;
    }else{
        mainInstance().setFullScreen(false)
        // s_bFullscreen = false;
    }

    if (interfaceInstance() !== null){
        interfaceInstance().resetFullscreenBut();
    }

    if (menuInstance() !== null){
        menuInstance().resetFullscreenBut();
    }

}


if (screenfull.enabled) {
    screenfull.on('change', function() {
        // s_bFullscreen = screenfull.isFullscreen;
        mainInstance().setFullScreen(screenfull.isFullscreen)

        if (interfaceInstance() !== null){
            interfaceInstance().resetFullscreenBut();
        }

        if (menuInstance() !== null){
            menuInstance().resetFullscreenBut();
        } 
    });
}

export {
    getParamValue,
    shuffle,
    createBitmap,
    playSound,
    createSprite,
    sizeHandler,
    s_iOffsetX,
    s_iOffsetY,
    s_iScaleFactor,
    isIOS
}

