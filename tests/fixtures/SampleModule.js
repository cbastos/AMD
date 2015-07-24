; (function () {
    "use strict";

    AMD.set({
        id: "SampleModule",
        from: function () {
            return SampleModule;
        }
    });

    function SampleModule() {

        this.someMethod = function () { };

    }

}());