(function () {
    "use strict";

    var nsKinect = WindowsPreview.Kinect;
    var constants = {
        bodyCount: 6
    };

    var kinectControl = WinJS.Class.define(
      function (canvas) {
          this._canvas = canvas
      },
      {
          init: function (index, sensor) {
              this._index = index;
              this._sensor = sensor;

              this._sensorColourFrameDimensions = {};
              this._sensorColourFrameDimensions.width = this._sensor.colorFrameSource.frameDescription.width;
              this._sensorColourFrameDimensions.height = this._sensor.colorFrameSource.frameDescription.height;
          },
          getSensor: function () {
              var bodyCount = 0;

              this._sensor = nsKinect.KinectSensor.getDefault();
              this._sensor.open();

              this._bodies = new Array(constants.bodyCount);
              this._bodyDrawers = new Array(constants.bodyCount);

              for (bodyCount = 0; bodyCount < constants.bodyCount; bodyCount++) {
                  this.init(bodyCount, this._sensor);
              }
          },
          openReader: function () {
              this._boundHandler = this._onFrameArrived.bind(this);
              this._reader = this._sensor.bodyFrameSource.openReader();
              this._reader.addEventListener('framearrived', this._boundHandler);
          },
          closeReader: function () {
              this._reader.removeEventListener('framearrived', this._boundHandler);
              this._reader.close();
              this._reader = null;
          },
          releaseSensor: function () {
              this._sensor.close();
              this._sensor = null;
          },
          _onFrameArrived: function (e) {
              var frame = e.frameReference.acquireFrame();
              var players = {};
              var i = 0;

              if (frame) {
                  frame.getAndRefreshBodyData(this._bodies);

                  for (i = 0; i < constants.bodyCount; i++) {
                      if (this._bodies[i].isTracked) {
                          players[i] = this._getPlayerData(i, this._bodies[i]);
                      }
                  }
                  this._canvas.draw(players);
                  frame.close();
              } else {
                  // If we're not able to get data from the Kinect anymore, then we should close/reopen the reader
                  // not sure if this is 100% successful yet
                  this.closeReader();
                  this.openReader();
              }
          },
          _getPlayerData: function (i, body) {
              var right = this._getJointPositions(body, 11);
              var left = this._getJointPositions(body, 7);
              var spine = this._getJointPositions(body, 1);

              var player = {};
                  player['right'] = {};
                  player['right']['status'] = this._getHandStatus(body, 'right');
                  player['right']['confidence'] = this._getHandConfidence(body, 'right');
                  player['right']['pos'] = {};
                  player['right']['pos'] = right[0];
                  player['right']['trackingState'] = right[1];

                  player['left'] = {};
                  player['left']['status'] = this._getHandStatus(body, 'left');
                  player['left']['confidence'] = this._getHandConfidence(body, 'left');
                  player['left']['pos'] = {};
                  player['left']['pos'] = left[0];
                  player['left']['trackingState'] = left[1];

                  player['spine'] = {};
                  player['spine']['pos'] = {};
                  player['spine']['pos'] = spine[0];
                  player['spine']['trackingState'] = spine[1];

              return (player);
          },
          _getHandStatus: function (body, hand) {
              var handStatus;
              var whichHand;

              if (hand === 'right') {
                  whichHand = body.handRightState;
              } else if (hand === 'left') {
                  whichHand = body.handLeftState;
              }
              if (body.isTracked) {
                  switch (whichHand) {
                      case 1: // not tracked
                      case 2: // open
                          handStatus = 'open';
                          break;
                      case 3: // closed
                          handStatus = 'closed';
                          break;
                      case 4: // lasso
                          handStatus = 'lasso';
                          break;
                      case 0: // unknown
                      default:
                          break;
                  }
              }
              return (handStatus);
          },
          _getHandConfidence: function (body, hand) {
              var confidence;

              if (hand === 'right') {
                  confidence = body.handRightConfidence;
              } else if (hand === 'left') {
                  confidence = body.handLeftConfidence;
              }
              return (confidence);
          },
          _getJointPositions: function (body, jointNumber) {
              var that = this;
              var jointPositions = {};
              var trackingStates = {};
              var depths = {};

              Iterable.forEach(body.joints,
                function (keyValuePair) {
                    var jointType = keyValuePair.key;
                    var joint = keyValuePair.value;

                    var isTracked = joint.trackingState === nsKinect.TrackingState.tracked;
                    var mappedPoint = that._mapPointToCanvasSpace(joint.position);

                    if (joint.jointType === jointNumber) {
                        jointPositions = mappedPoint;
                        trackingStates = joint.trackingState;
                    }
                }
              );
              return [jointPositions, trackingStates];
          },
          _mapPointToCanvasSpace: function (cameraSpacePoint) {
              var colourPoint = this._sensor.coordinateMapper.mapCameraPointToColorSpace(cameraSpacePoint);

              colourPoint.x *= (1920 / this._sensorColourFrameDimensions.width);
              colourPoint.y *= (1080 / this._sensorColourFrameDimensions.height);

              return (colourPoint);
          },
          _boundHandler: null,
          _clearCanvas: null,
          _bodyDrawerFactory: null,
          _sensor: null,
          _index: -1,
          _sensorColourFrameDimensions: null,
          _reader: null,
          _bodyDrawers: null,
          _bodies: null
      }
    );

    WinJS.Namespace.define('App', {
        KinectControl: kinectControl
    });

})();