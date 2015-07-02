(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            args.setPromise(WinJS.UI.processAll().done(function () {
                var canvas = new App.DrawCanvas();
                var controller = new App.KinectControl(canvas);
                canvas.init();
                controller.getSensor();
                controller.openReader();
            }));
        }
    };

    app.start();
})();
