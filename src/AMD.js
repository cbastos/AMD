var AMD = AMD || {};
(function (framework) {
    "use strict";
    var scriptManager = new framework.classes.ScriptManager(),
        moduleManager = new framework.classes.ModuleManager(scriptManager);

    framework.set = function (element) {
        if (typeof (element.from) === "function") {
            moduleManager.register(element);
        } else {
            scriptManager.register(element);
        }
    };
    framework.get = moduleManager.get;
    framework.config = function (configDetails) {
        if (typeof configDetails !== "undefined") {
            if (typeof configDetails.pathResolver !== "undefined") {
                scriptManager.setPathResolver(configDetails.pathResolver);
            }
            if (typeof configDetails.dependencies !== "undefined") {
                moduleManager.setDefaultDependencies(configDetails.dependencies);
            }
        }
    };

}(AMD));