/** 
 * The AMD (asynchronous module definition) AMD.
 * @class AMD
 * @global
 */
var AMD = AMD || {};
(function (AMD) {
    "use strict";
    var scriptManager = new AMD.classes.ScriptManager(),
		moduleManager = new AMD.classes.ModuleManager(scriptManager);

	/** 
	 * Registers a new element (module or script) in the AMD System.
	 * @memberOf AMD
	 * @param {Object} element The element (module or script) you want to register in the AMD System.
	*/
    AMD.set = function (element) {
        if (typeof (element.from) === "function") {
            moduleManager.register(element);
        } else {
            scriptManager.register(element);
        }
    };

	//TODO: This method should retrieve modules and scripts, not only modules.
	/** 
	 * Retrieves an element (module or script) previously registered in the AMD System.
	 * @memberOf AMD
	 * @param {Object} element Retrieves an element (module or script) with his dependencies.
	*/
    AMD.get = function () {
    	return moduleManager.get.apply(this, arguments);
    };

	/** 
	 * Change configuration of the AMD. You can configure a new path resolver or the default dependencies for all elements.
	 * @memberOf AMD
	 * @param {Object} configDetails The configuration details.
	*/
    AMD.config = function (configDetails) {
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