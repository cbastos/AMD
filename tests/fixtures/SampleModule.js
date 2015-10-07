; (function () {
    "use strict";

    JSL.set({
        id: "SampleModule",
        from: function () {
            return SampleModule;
        }
    });

    function SampleModule() {

        this.someMethod = function () { };

    }

}());