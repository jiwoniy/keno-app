const settings = () => {
  var CANVAS_WIDTH = 1920;
  let CANVAS_HEIGHT = 1080;

  var EDGEBOARD_X = 250;
  var EDGEBOARD_Y = 80;

  var FPS_TIME      = 1000/24;
  var DISABLE_SOUND_MOBILE = false;

  var PRIMARY_FONT = "Lora";
  var SECONDARY_FONT = "Arial";
  var PRIMARY_FONT_COLOUR = "#FFFFFF";

  var STATE_LOADING = 0;
  var STATE_MENU    = 1;
  var STATE_HELP    = 1;
  var STATE_GAME    = 3;

  var ON_MOUSE_DOWN  = 0;
  var ON_MOUSE_UP    = 1;
  var ON_MOUSE_OVER  = 2;
  var ON_MOUSE_OUT   = 3;
  var ON_DRAG_START  = 4;
  var ON_DRAG_END    = 5;

  var NUM_DIFFERENT_BALLS = 5;
  // var ANIMATION_SPEED;
  let animationSpeend = null

  // var WIN_OCCURRENCE = new Array();
  // var WIN_OCCURRENCE = [];
  // var PAYOUTS = []
  let payOuts = []

  // var BANK;
  let bankMoney = 0;
  let playerMoney = 0; 

  // var BET = [];
  const BET = [0.10, 0.20, 0.30, 0.50, 1, 2, 3, 5];


  let ENABLE_FULLSCREEN = true;
  let ENABLE_CHECK_ORIENTATION = true;
  let SHOW_CREDITS =  true;

  return {
    // getCanvasWidth: () => CANVAS_WIDTH,
    // setCanvasWidth: () => {
    //   return CANVAS_WIDTH
    // },
    CANVAS_WIDTH,
    CANVAS_HEIGHT,

    EDGEBOARD_X,
    EDGEBOARD_Y,

    FPS_TIME,
    DISABLE_SOUND_MOBILE,

    PRIMARY_FONT,
    SECONDARY_FONT,
    PRIMARY_FONT_COLOUR,

    STATE_LOADING,
    STATE_MENU,
    STATE_HELP,
    STATE_GAME,

    ON_MOUSE_DOWN,
    ON_MOUSE_UP,
    ON_MOUSE_OVER,
    ON_MOUSE_OUT,
    ON_DRAG_START,
    ON_DRAG_END,

    NUM_DIFFERENT_BALLS,
    // ANIMATION_SPEED,
    getAnimationSpeed: () => animationSpeend,
    setAnimationSpeed: (value) => {
      animationSpeend = value
    },

    // WIN_OCCURRENCE,
    // PAYOUTS,
    getPayOuts: () => payOuts,
    setPayOuts: (payload) => {
      payOuts = payload
    },
    // payOuts,
    // BANK,
    getBankMoney: () => bankMoney,
    setBankMoney: (money) => {
      bankMoney = money
    },
    // START_PLAYER_MONEY,
    getPlayerMoney: () => playerMoney,
    setPlayerMoney: (money) => {
      playerMoney = money
    },
    BET,

    ENABLE_FULLSCREEN,
    ENABLE_CHECK_ORIENTATION,
    SHOW_CREDITS,
  }
}

// var CANVAS_WIDTH = 1920;
// let CANVAS_HEIGHT = 1080;

// var EDGEBOARD_X = 250;
// var EDGEBOARD_Y = 80;

// var FPS_TIME      = 1000/24;
// var DISABLE_SOUND_MOBILE = false;

// var PRIMARY_FONT = "Lora";
// var SECONDARY_FONT = "Arial";
// var PRIMARY_FONT_COLOUR = "#FFFFFF";

// var STATE_LOADING = 0;
// var STATE_MENU    = 1;
// var STATE_HELP    = 1;
// var STATE_GAME    = 3;

// var ON_MOUSE_DOWN  = 0;
// var ON_MOUSE_UP    = 1;
// var ON_MOUSE_OVER  = 2;
// var ON_MOUSE_OUT   = 3;
// var ON_DRAG_START  = 4;
// var ON_DRAG_END    = 5;

// var NUM_DIFFERENT_BALLS = 5;
// var ANIMATION_SPEED;

// // var WIN_OCCURRENCE = new Array();
// // var WIN_OCCURRENCE = [];
// // var PAYOUTS = []
// const payOuts = []

// var BANK;
// var START_PLAYER_MONEY; 

// // var BET = [];
// var BET = [0.10, 0.20, 0.30, 0.50, 1, 2, 3, 5];


// let ENABLE_FULLSCREEN = true;
// let ENABLE_CHECK_ORIENTATION = true;
// let SHOW_CREDITS =  true;
export default settings();
