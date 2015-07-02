(function () {
    "use strict";

    var jointConnection = WinJS.Class.define(
      function () {
          this._joints = [];
      },
      {
          forEachPair: function (handler) {
              for (var i = 0; i < this._joints.length - 1; i++) {
                  handler(this._joints[i], this._joints[i + 1]);
              }
          },
          _joints: null
      },
      {
          createFromStartingJoint: function (jointType, range) {
              var connection = new jointConnection();

              for (var i = 0; i < range; i++) {
                  connection._joints.push(jointType + i);
              }

              return (connection);
          },
          createFromJointList: function () {
              var connection = new jointConnection();

              for (var i = 0; i < arguments.length; i++) {
                  connection._joints.push(arguments[i]);
              }
              return (connection);
          }
      }
    );

    WinJS.Namespace.define('Sample',
      {
          JointConnection: jointConnection
      });

})();