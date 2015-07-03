(function () {
    "use strict";

    var constants = {
        maxPlayers: 4,
        handHeight: 76,
        handWidth: 60
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
          },
          clearScreen: function () {
              this._context.clearRect(0, 0, this._width, this._height);
          },
          draw: function (players) {
              var that = this;
              var playerCount = 0;
              var activePlayers = this._activePlayers;
              var pendingPlayers = this._pendingPlayers;

              this.clearScreen();
              for (var p in players) {
                  // when a new player enters the area, start a timer for 5 seconds before creating them on screen
                  // set the active players array for their number to true
                  // make sure to set their last position so it doesn't break the code
                  // fire the instructions for the new user
                  var index = activePlayers.indexOf(p);
                  var pending = pendingPlayers.indexOf(p);
                  if (index === -1) {
                      if (pending === -1) {
                          pendingPlayers.push(p);
                          setTimeout(function () {
                              pendingPlayers.splice(pending, 1);
                              if (players[p]) {
                                  activePlayers.push(p);
                                  that.showInstructions(p);
                              }
                          }, 5000);
                      }
                  } else {
                      playerCount++;
                  }

                  // if there are less players than the max
                  // draw their hands and do everything we need to do on-screen
                  if (playerCount <= constants.maxPlayers && index > -1) {
                      this.drawHands(p, players[p], this._lastPlayers[p]);
                  }
                  if (playerCount > constants.maxPlayers) {
                      // if there are more players than we allow, start/stop an interval timer to show the "be nice" instructions
                      // don't show it again for 30 seconds after it goes once using a timer
                      this.showTooManyPlayers();
                  }

                  // when a player is not tracked on the screen, remove them from the active players array
                  // and remove their data from the last players object
                  if (!players[p]) {
                      this._lastPlayers[p] = null;
                      activePlayers.splice(index, 1);
                  }
              }
              this._lastPlayers = players;
          },
          drawHands: function (p, player, lastPlayer) {
              var context = this._context;
              var rightHand = new Image();
              var leftHand = new Image();
              
              context.save();
              if (player['right']['confidence'] === 1) {
                  if (player['right']['status'] === 'closed') {
                      rightHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      rightHand.src = 'images/P' + p + '_open.png';
                  }
              } else {
                  if (lastPlayer['right']['status'] === 'closed') {
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
                  context.translate(-(Math.round(lastPlayer['right']['pos']['x'] - constants.handWidth / 2)), Math.round(lastPlayer['right']['pos']['y'] - constants.handHeight / 2));
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
              } else {
                  if (lastPlayer['left']['status'] === 'closed') {
                      leftHand.src = 'images/P' + p + '_closed.png';
                  } else {
                      leftHand.src = 'images/P' + p + '_open.png';
                  }
              }
              if (player['left']['trackingState'] === 2) {
                  context.drawImage(leftHand, Math.round(player['left']['pos']['x']), Math.round(player['left']['pos']['y']), 60, 76);
              } else if (player['left']['trackingState'] === 1 || 0) {
                  context.globalAlpha = 0.5;
                  context.drawImage(leftHand, Math.round(lastPlayer['left']['pos']['x']), Math.round(lastPlayer['left']['pos']['y']), 60, 76);
              }
              context.restore();
          },
          showInstructions: function (p) {
              console.log('instructions for ' + p);
          },
          showTooManyPlayers: function () {
              console.log('too many players');
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
          _lastPlayers: null,
          _activePlayers: null,
          _pendingPlayers: null,
          _showAlert: false,
          _hideTooManyPlayers: false
      }
    );

    WinJS.Namespace.define('App', {
        DrawCanvas: drawCanvas
    });

})();