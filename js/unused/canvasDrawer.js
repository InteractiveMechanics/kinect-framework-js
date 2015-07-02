(function () {
    "use strict";

    var nsKinect = WindowsPreview.Kinect;

    var constants =
    {
        circleLeafRadius: 30,
        circleNonLeafRadius: 10,
        lineWidth: 3
    };

    var canvasDrawer = WinJS.Class.define(
      function () {
      },
      {
          init: function (index, sensor) {
              this._index = index;
              this._sensor = sensor;

              this._sensorColourFrameDimensions = {};
              this._sensorColourFrameDimensions.width = this._sensor.colorFrameSource.frameDescription.width;
              this._sensorColourFrameDimensions.height = this._sensor.colorFrameSource.frameDescription.height;
          },
          drawFrame: function (body) {
              var handStatus = this._handStatus(body);
              var jointPositions = this._drawJoints(body, handStatus);
          },
          _handStatus: function (body) {
              var handStatus = {};

              if (body.isTracked) {
                  switch (body.handRightState) {
                      case 1:
                      case 2:
                          this._rightHandStatus = 'open';
                          break;
                      case 3:
                          this._rightHandStatus = 'closed';
                          break;
                      case 4:
                          this._rightHandStatus = 'lasso';
                          break;
                      case 0:
                      default:
                          break;
                  }
                  switch (body.handLeftState) {
                      // 0: unknown, 1: not tracked, 2: open, 3: closed, 4: lasso
                      case 1:
                      case 2:
                          this._leftHandStatus = 'open';
                          break;
                      case 3:
                          this._leftHandStatus = 'closed';
                          break;
                      case 4:
                          this._leftHandStatus = 'lasso';
                          break;
                      case 0:
                      default:
                          break;
                  }
                  handStatus['right'] = this._rightHandStatus;
                  handStatus['left'] = this._leftHandStatus;
              }
              return (handStatus);
          },
          // TODO: Change to drawHands
          // TODO: Separate out drawing from calculations
          _drawJoints: function (body, handStatus) {
              var that = this;
              var jointPositions = {};
              
              //    1:  'SpineMid',
              //    6:  'WristLeft',
              //    7:  'HandLeft',
              //    10: 'WristRight',
              //    11: 'HandRight',
              //    21: 'HandTipLeft',
              //    22: 'ThumbLeft',
              //    23: 'HandTipRight',
              //    24: 'ThumbLeft'
              
              Iterable.forEach(body.joints,
                function (keyValuePair) {
                    var jointType = keyValuePair.key;
                    var joint = keyValuePair.value;

                    var isTracked = joint.trackingState === nsKinect.TrackingState.tracked;
                    var mappedPoint = that._mapPointToCanvasSpace(joint.position);
                    var context = canvasDrawer.canvas.getContext('2d');

                    if (that._isJointForDrawing(joint, mappedPoint)) {
                        // TODO: Replace below with drawing the hand on the centroid
                        // TODO: Select the right hand image based on the player number
                        // TODO: Change the type of hand image used based on handStatus
                        // TODO: Rotate the hand around the angle of rotation

                        /*
                        context.fillStyle =
                          isTracked ?
                          canvasDrawer._colors[that._index] : canvasDrawer._inferredColor;

                        context.beginPath();

                        context.arc(
                          mappedPoint.x,
                          mappedPoint.y,
                          that._isLeaf(jointType) ? constants.circleLeafRadius : constants.circleNonLeafRadius,
                          2 * Math.PI,
                          false);

                        context.fill();
                        context.stroke();
                        context.closePath();

                        jointPositions[jointType] = mappedPoint;
                        */
                    }
                }
              );
              
              return (jointPositions);
          },
          // TODO: Remove this
          _isLeaf: function (jointType) {
              var leafs = [nsKinect.JointType.head, nsKinect.JointType.footLeft, nsKinect.JointType.footRight];
              return (leafs.indexOf(jointType) !== -1);
          },
          _isJointForDrawing: function (joint, point) {
              return (
                (joint.trackingState !== nsKinect.TrackingState.notTracked) &&
                (point.x !== Number.NEGATIVE_INFINITY) &&
                (point.y !== Number.POSITIVE_INFINITY) &&
                ((joint.jointType === 7) || (joint.jointType === 11)));
          },
          _mapPointToCanvasSpace: function (cameraSpacePoint) {
              // NB: with the way I've set up my canvas in this example (1920x1080), this should be
              // a 1:1 mapping but leaving the flexibility here.
              var colourPoint = this._sensor.coordinateMapper.mapCameraPointToColorSpace(
                cameraSpacePoint);

              colourPoint.x *= canvasDrawer.canvas.width / this._sensorColourFrameDimensions.width;
              colourPoint.y *= canvasDrawer.canvas.height / this._sensorColourFrameDimensions.height;

              return (colourPoint);
          },
          _index: -1,
          _sensorColourFrameDimensions: null,
          _sensor: null,
          // Is this good enough? Do we get the right data returned per user?
          _leftHandStatus: null,
          _rightHandStatus: null
      },
      {
          clearFrames: function () {
              var canvas = canvasDrawer.canvas;
              var ctx = canvas.getContext('2d');

              ctx.clearRect(0, 0, canvas.width, canvas.height);
          },
          canvas: {
              get: function () {
                  return (canvasDrawer._canvas);
              },
              set: function (value) {
                  canvasDrawer._canvas = value;
              }
          },
          _canvas: null,
          // Switch from colors to hands?
          _colors: ['red', 'green', 'blue', 'yellow', 'purple', 'orange'],
          _inferredColor: 'grey'
      }
    );

    WinJS.Namespace.define('Sample',
      {
          CanvasDrawer: canvasDrawer
      });

})();