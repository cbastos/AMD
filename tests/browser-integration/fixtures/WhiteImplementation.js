(function () {
    "use strict";

    JSL.set({
        id: "ModuleWithMultipleImplementations",
        from: function () {
            return ModuleWithMultipleImplementations;
        }
    });

    function ModuleWithMultipleImplementations() {

        this.IamWhiteImplementation = true;

    }

}());
