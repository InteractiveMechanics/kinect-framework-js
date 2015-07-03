(function () {
    "use strict";

    var constants = {
        maxPlayers: 4,
        handHeight: 76,
        handWidth: 60,
        instructionsDuration: 5000,
        alertTimeout: 30000
    };

    var drawCanvas = WinJS.Class.define(
      function () {
      },
      {
          init: function () {
              this._canvas = document.getElementById('kinectCanvas');
              this._context = this._canvas.getContext('2d');
              this._width = this._canvas.width;
              this._height = this._canvas.height;
              this._activePlayers = [];
              this._pendingPlayers = [];
              this._lastPlayers = {};
              this._lastConfidentPlayers = {};
          },
          clearScreen: function () {
              this._context.clearRect(0, 0, this._width, this._height);
          },
          draw: function (players) {
              var that = this;
              var count = 0;
              var activePlayers = this._activePlayers;
              var pendingPlayers = this._pendingPlayers;
              var lastPlayers = this._lastPlayers;
              var lastConfidentPlayers = this._lastConfidentPlayers;

              this.clearScreen();
              for (var p in players) {
                  // I think we're going to need a check here where we add p to the pending players array first, then
                  // use that information to decide if we have too many players 
                  count++;

                  // when a new player enters the area, start a timer for 5 seconds before creating them on screen
                  // set the active players array for their number to true
                  // make sure to set their last position so it doesn't break the code
                  // fire the instructions for the new user
                  var index = activePlayers.indexOf(p);
                  var pending = pendingPlayers.indexOf(p);
                  if (index === -1) {
                      if (pending === -1) {
                          pendingPlayers.push(p);
                          console.log("Player " + p + " joined the game.")

                          setTimeout(function () {
                              pendingPlayers.splice(pending, 1);
                              if (players[p]) {
                                  activePlayers.push(p);
                                  lastConfidentPlayers[p] = players[p];
                                  lastPlayers[p] = players[p];
                                  that.showInstructions(p);
                              }
                          }, 5000);
                      }
                  }

                  // if there are less players than the max
                  // draw their hands and do everything we need to do on-screen
                  if (activePlayers.length <= constants.maxPlayers && index > -1) {
                      this.drawHands(p, players[p], this._lastPlayers[p]);
                  }
              }
              // Run this method often, checks to see if we have too many people
              this._totalBodies = count;
              this.showTooManyPlayers(this._totalBodies);

              this._lastPlayers = players;
          },
          drawHands: function (p, player, lastPlayer) {
              var context = this._context;
              var rightHand = new Image();
              var leftHand = new Image();
              
              // If the kinect is confident and is able to accurately track the hand, then use that date and store it for the future
              // if the kinect is not confident and is not able to accurately track the hand, then use the last set of confident data that was stored

              context.save();
              if (player['right']['confidence'] === 1) {
                  if (player['right']['status'] === 'closed') {
                      rightHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      rightHand.src = 'images/P' + p + '_open.png';
                  }
                  this._lastConfidentPlayers[p]['right'] = player['right'];
              } else {
                  if (this._lastConfidentPlayers[p]['right']['status'] === 'closed') {
                      rightHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      rightHand.src = 'images/P' + p + '_open.png';
                  }
              }
              context.scale(-1, 1);
              if (player['right']['trackingState'] === 2) {
                  context.translate(-(Math.round(player['right']['pos']['x'] - constants.handWidth / 2)), Math.round(player['right']['pos']['y'] - constants.handHeight / 2));
                  context.drawImage(rightHand, -60, 0, 60, 76);
              } else if (player['right']['trackingState'] === 1 || 0) {
                  context.translate(-(Math.round(this._lastConfidentPlayers[p]['right']['pos']['x'] - constants.handWidth / 2)), Math.round(this._lastConfidentPlayers[p]['right']['pos']['y'] - constants.handHeight / 2));
                  context.globalAlpha = 0.5;
                  context.drawImage(rightHand, -60, 0, 60, 76);
              }
              context.restore();

              context.save();
              if (player['left']['confidence'] === 1) {
                  if (player['left']['status'] === 'closed') {
                      leftHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      leftHand.src = 'images/P' + p + '_open.png';
                  }
                  this._lastConfidentPlayers[p]['left'] = player['left'];
              } else {
                  if (this._lastConfidentPlayers[p]['left']['status'] === 'closed') {
                      leftHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      leftHand.src = 'images/P' + p + '_open.png';
                  }
              }
              if (player['left']['trackingState'] === 2) {
                  context.drawImage(leftHand, Math.round(player['left']['pos']['x']), Math.round(player['left']['pos']['y']), 60, 76);
              } else if (player['left']['trackingState'] === 1 || 0) {
                  context.globalAlpha = 0.5;
                  context.drawImage(leftHand, Math.round(this._lastConfidentPlayers[p]['left']['pos']['x']), Math.round(this._lastConfidentPlayers[p]['left']['pos']['y']), 60, 76);
              }
              context.restore();
          },
          showInstructions: function (p) {
              console.log('Show instructions for Player ' + p);
          },
          showTooManyPlayers: function (count) {
              // if our alert active variable is false, then show the message, fade it out after five seconds, and don't show it again for thirty seconds
              // if the alert active variable is true, then do nothing
              if (count > constants.maxPlayers && this._activeTooManyPlayers == false) {
                  console.log('Too many players');
                  this._activeTooManyPlayers = true;

                  setTimeout(function () {
                      console.log('Timer ended for "Too many players"');
                      this._activeTooManyPlayers = false;
                  }, constants.alertTimeout);
              }
          },
          calculateAngleDistance: function (deltaX, deltaY) {
              var angle = Math.atan2(deltaX, deltaY) - 45 / Math.PI;
              var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
              return [angle, distance];
          },
          _canvas: null,
          _context: null,
          _width: null,
          _height: null,

          // Stores object data for players as reference for confidence/history
          _lastPlayers: null,
          _lastConfidentPlayers: null,

          // Keeps track of number of players and state
          _activePlayers: null,
          _pendingPlayers: null,
          _totalBodies: 0,

          // For alerts and messages
          _activeAlert: false,
          _activeTooManyPlayers: false
      }
    );

    WinJS.Namespace.define('App', {
        DrawCanvas: drawCanvas
    });

})();