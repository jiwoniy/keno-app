import React, { Component } from 'react';
import $ from 'jquery'

import CMain from './game/js/CMain.js'
import {
  getParamValue,
  isIOS,
  sizeHandler
} from './game/js/ctl_utils.js'

import './game/css/main.css'
import './game/css/orientation_utils.css'

const BlockGameStyle = {
  position: 'fixed',
  backgroundColor: 'transparent',
  top: '0px',
  left: '0px',
  width: '100%',
  height: '100%',
  display: 'none'
}

class Keno extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parent: window.parent,
    };
  }

  componentDidMount () {
    const oMain = CMain(true, {  
      bank_money : 100,
      start_player_money: 100,
      win_occurrence : [ 
        '-',
        65, //WIN OCCURRENCE WITH 2 NUMBERS CHOSEN
        60, //WIN OCCURRENCE WITH 3 NUMBERS CHOSEN
        55, //WIN OCCURRENCE WITH 4 NUMBERS CHOSEN
        50, //WIN OCCURRENCE WITH 5 NUMBERS CHOSEN
        45, //WIN OCCURRENCE WITH 6 NUMBERS CHOSEN
        40, //WIN OCCURRENCE WITH 7 NUMBERS CHOSEN
        35, //WIN OCCURRENCE WITH 8 NUMBERS CHOSEN
        30, //WIN OCCURRENCE WITH 9 NUMBERS CHOSEN
        25  //WIN OCCURRENCE WITH 10 NUMBERS CHOSEN
      ],
      //PAYOUT VALUES TABLE: {#HITS, BET MULTIPLY, HITS OCCURRENCE}
      payouts : [
        { hits: ['-'],           pays: ['-'],                            occurrence: [0]},                   //PAYOUTS FOR 1 NUMBERS
        { hits: [2,1],           pays: [9,1],                            occurrence: [20,80]},               //PAYOUTS FOR 2 NUMBERS
        { hits: [3,2],           pays: [47,2],                           occurrence: [20,80]},               //PAYOUTS FOR 3 NUMBERS
        { hits: [4,3,2],         pays: [91,5,2],                         occurrence: [10,30,60]},            //PAYOUTS FOR 4 NUMBERS
        { hits: [5,4,3],         pays: [820,12,3],                       occurrence: [10,30,60]},            //PAYOUTS FOR 5 NUMBERS
        { hits: [6,5,4,3],       pays: [1600,70,4,3],                    occurrence: [10,20,30,40]},         //PAYOUTS FOR 6 NUMBERS
        { hits: [7,6,5,4,3],     pays: [7000,400,21,2,1],                occurrence: [5,10,20,30,35]},       //PAYOUTS FOR 7 NUMBERS
        { hits: [8,7,6,5,4],     pays: [10000,1650,100,12,2],            occurrence: [5,10,20,30,35]},       //PAYOUTS FOR 8 NUMBERS
        { hits: [9,8,7,6,5,4],   pays: [10000,4700,335,44,6,1],          occurrence: [1,4,10,20,30,35]},     //PAYOUTS FOR 9 NUMBERS
        { hits: [10,9,8,7,6,5],  pays: [10000,4500,1000,142,24,5],       occurrence: [1,4,10,15,30,40]}      //PAYOUTS FOR 10 NUMBERS
      ],
      animation_speed : 300,
      fullscreen:true, //SET THIS TO FALSE IF YOU DON'T WANT TO SHOW FULLSCREEN BUTTON
      check_orientation:true,     //SET TO FALSE IF YOU DON'T WANT TO SHOW ORIENTATION ALERT ON MOBILE DEVICES
      show_credits:true,           //SET THIS VALUE TO FALSE IF YOU DON'T TO SHOW CREDITS BUTTON
      //////////////////////////////////////////////////////////////////////////////////////////
      ad_show_counter: 5     //NUMBER OF TURNS PLAYED BEFORE AD SHOWN
      //
     });

     $(oMain).on("start_session", function(evt) {
      if(getParamValue('ctl-arcade') === "true"){
          this.state.parent.__ctlArcadeStartSession();
      }
      //...ADD YOUR CODE HERE EVENTUALLY
      });

      $(oMain).on("end_session", function(evt) {
          if(getParamValue('ctl-arcade') === 'true'){
            this.state.parent.__ctlArcadeEndSession();
          }
          //...ADD YOUR CODE HERE EVENTUALLY
      });

      $(oMain).on("bet_placed", function (evt, oBetInfo) {
        // var iTotBet = oBetInfo.tot_bet;
        // var iMoney = oBetInfo.money;
        // var iNumSelected = oBetInfo.num_selected;
      });

      $(oMain).on("save_score", function(evt,iScore) {
          if(getParamValue('ctl-arcade') === "true"){
            this.state.parent.__ctlArcadeSaveScore({score:iScore});
          }
          //...ADD YOUR CODE HERE EVENTUALLY
      });

      $(oMain).on("show_interlevel_ad", function(evt) {
          if(getParamValue('ctl-arcade') === "true"){
            this.state.parent.__ctlArcadeShowInterlevelAD();
          }
          //...ADD YOUR CODE HERE EVENTUALLY
      });

      $(oMain).on("share_event", function(evt, iMoney) {
          if(getParamValue('ctl-arcade') === "true"){
            this.state.parent.__ctlArcadeShareEvent({ img:"200x200.jpg",
                                                // title:TEXT_CONGRATULATIONS,
                                                // msg:TEXT_SHARE_1 + iMoney + TEXT_SHARE_2,
                                                // msg_share:TEXT_SHARE_3 + iMoney + TEXT_SHARE_4
                                            });
          }
          //...ADD YOUR CODE HERE EVENTUALLY
      });

      if(isIOS()) { 
        setTimeout(function(){sizeHandler();},200); 
      } else { 
        sizeHandler(); 
      }
  }
  render() {
    return (
      <div>
        <canvas id="canvas" className='ani_hack' width="1920" height="1080">
        </canvas>
        <div data-orientation="landscape" className="orientation-msg-container">
          <p className="orientation-msg-text">Please rotate your device</p>
        </div>
        <div
          id="block_game"
          style={BlockGameStyle}>
        </div>
      </div>
    );
  }
}

export default Keno;
