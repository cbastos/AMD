/** 
 * The JSL (asynchronous module definition) manager.
 * @namespace JSL
*/
var JSL = JSL || { classes: {} };
(function (JSL) {
	"use strict";
	var scriptProvider = new JSL.classes.ScriptProvider(),
		startingModulesTracker = new JSL.classes.ModuleRequestTracker(),
		dependenciesFactory = new JSL.classes.DependenciesFactory(),
		moduleManager = new JSL.classes.ModuleManager(scriptProvider, startingModulesTracker, dependenciesFactory);

	/** 
	 * Registers a new element (module or script) in the JSL System.
	 * @memberOf JSL
	 * @param {Object} element The element (module or script) you want to register in the JSL System.
	*/
	JSL.set = function (element) {
		if (typeof (element.from) === "function") {
			moduleManager.register(element);
		} else {
			scriptProvider.register(element);
		}
	};

	//TODO: This method should retrieve modules and scripts, not only modules.
	/** 
	 * Retrieves an element (module or script) previously registered in the JSL System.
	 * @memberOf JSL
	 * @param {Object} element Retrieves an element (module or script) with his dependencies.
	*/
	JSL.get = function () {
		return moduleManager.get.apply(this, arguments);
	};

	/** 
	 * Change configuration of the JSL manager. You can configure a new path resolver or the default dependencies for all elements.
	 * @memberOf JSL
	 * @param {Object} configDetails The configuration details.
	*/
	JSL.config = function (configDetails) {
		if (typeof configDetails !== "undefined") {
			if (typeof configDetails.pathResolver !== "undefined") {
				scriptProvider.setPathResolver(configDetails.pathResolver);
			}
			if (typeof configDetails.dependencies !== "undefined") {
				moduleManager.setDefaultDependencies(configDetails.dependencies);
			}
		}
	};

}(JSL));