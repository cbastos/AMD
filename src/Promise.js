var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.Promise = Promise;

    function Promise() {
        var self = this;
        var resolved = false, callback, args;

        self.then = function (clback) {
            callback = clback;
            if (resolved) {
                callback.apply({}, args);
            }
        };
        self.done = function () {
            args = arguments;
            resolved = true;
            if (callback) {
                callback.apply({}, args);
            }
        };
    }
}(AMD));
