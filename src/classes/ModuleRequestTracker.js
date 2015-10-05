var AMD = AMD || {};
(function (AMD) {
    "use strict";
    AMD.classes = AMD.classes || {};
    AMD.classes.ModuleRequestTracker = ModuleRequestTracker;
    
	/** 
	 * @constructor ModuleRequestTracker
	 * @class The module retrieving request tracker.
	 */
    function ModuleRequestTracker() {
        this.startingModules = {};
    }

	/** 
	 * Registers a request of a module in the tracker.
	 * @memberOf ModuleRequestTracker
	 * @param {{id:String,moduleRequestPromise:Promise}} moduleRequest The info of the request for a module.
	*/
    ModuleRequestTracker.prototype.registerModuleRequest = function (moduleRequest) {
    	this.startingModules[moduleRequest.id] = this.startingModules[moduleRequest.id] || [];
    	this.startingModules[moduleRequest.id].push(moduleRequest.moduleRequestPromise);
    };

	/** 
	 * Gets the number of requests for a module.
	 * @memberOf ModuleRequestTracker
	 * @param {String} moduleIdentifier The module identifier.
	 * @returns {Number} Number of requests for a module.
	*/
    ModuleRequestTracker.prototype.getNumberOfRequestsFor = function (moduleIdentifier) {
        return this.startingModules[moduleIdentifier] ? this.startingModules[moduleIdentifier].length : 0;
    };

	/** 
	 * Gets if a module has requests to be retrieved.
	 * @memberOf ModuleRequestTracker
	 * @param {String} moduleIdentifier The module identifier.
	 * @returns {Boolean} The module has requests to be retrieved.
	*/
    ModuleRequestTracker.prototype.hasRequestsRegisteredFor = function (moduleIdentifier) {
        return this.startingModules[moduleIdentifier] && this.startingModules[moduleIdentifier].length !== 0;
    };

	/** 
	 * Gets the first request for retrieve a module.
	 * @memberOf ModuleRequestTracker
	 * @param {String} moduleIdentifier The module identifier.
	 * @returns {{id: string, startPromise: Promise}} the first request to retrieve a module.
	*/
    ModuleRequestTracker.prototype.getFirstModuleRequestFor = function (moduleIdentifier) {
        return this.startingModules[moduleIdentifier][0];
    };

	/** 
	 * Deletes the first request of a module.
	 * @memberOf ModuleRequestTracker
	 * @param {String} moduleIdentifier The module identifier.
	*/
    ModuleRequestTracker.prototype.deleteFirstModuleRequestFor = function (moduleIdentifier) {
    	this.startingModules[moduleIdentifier].splice(0, 1);
    };

}(AMD));
