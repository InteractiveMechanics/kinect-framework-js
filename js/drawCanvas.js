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
              this._canvas = document.getElementById('canvas');
              this._context = this._canvas.getContext('2d');
              this._width = this._canvas.width;
              this._height = this._canvas.height;
          },
          clearScreen: function () {
              this._context.clearRect(0, 0, this._width, this._height);
          },
          draw: function (players) {
              this.clearScreen();
              this.drawHands(players);
              this.drawAngles(players);

              this._lastPlayers = players;
          },
          drawHands: function (players) {
              var context = this._context;
              var rightHand = new Image();
              var leftHand = new Image();
              var playerCount = 0;

              for (var p in players) {
                  var player = players[p];
                  var lastPlayer = this._lastPlayers[p];
                  playerCount++;
                  
                  if (playerCount <= constants.maxPlayers) {
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
                      if (player['right']['trackingState'] === 2) {
                          context.drawImage(leftHand, Math.round(player['left']['pos']['x']), Math.round(player['left']['pos']['y']), 60, 76);
                      } else if (player['right']['trackingState'] === 1 || 0) {
                          context.globalAlpha = 0.5;
                          context.drawImage(leftHand, Math.round(lastPlayer['left']['pos']['x']), Math.round(lastPlayer['left']['pos']['y']), 60, 76);
                      }
                      context.restore();
                  }
              }
          },
          drawAngles: function (players) {
              var context = this._context;
              var arrow = new Image();
              var playerCount = 0;

              for (var p in players) {
                  var player = players[p];
                  playerCount++;
                
                  if (playerCount <= constants.maxPlayers) {
                      var deltaX = player['right']['pos']['x'] - player['spine']['pos']['x'];
                      var deltaY = player['right']['pos']['y'] - player['spine']['pos']['y'];
                      var angleDistance = this.calculateAngleDistance(deltaX, deltaY);

                      arrow.src = 'images/arrow.png';
                      context.save();
                      context.translate(player['spine']['pos']['x'], player['spine']['pos']['y']);
                      context.translate(60, 40);
                      context.rotate(-angleDistance[0]);
                      context.drawImage(arrow, -60, -40, 120, 80);
                      context.restore();
                  }
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
          _lastPlayers: null,
          _throwHoldPoints: null
      }
    );

    WinJS.Namespace.define('App', {
        DrawCanvas: drawCanvas
    });

})();