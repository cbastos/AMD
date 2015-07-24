(function () {
    "use strict";

    AMD.set({
        id: "ModuleWithMultipleImplementations",
        from: function () {
            return ModuleWithMultipleImplementations;
        }
    });

    function ModuleWithMultipleImplementations() {

        this.IamWhiteImplementation = true;

    }

}());
