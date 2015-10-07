var JSL = JSL || { classes: {} };
(function (JSL) {
	"use strict";

	/** 
	 * @class The promise.
	 * @constructor Promise
	 */
	function Promise() {
		var self = this,
			resolved = false,
			callback,
			args;

		/** 
		 * Sets the callback function that must be executed when the promise is resolved with a success result.
		 * @memberOf Promise
		 * @param {Object} thenCallback The callback that must be executed when the promise be resolved.
		*/
		self.then = function (thenCallback) {
			callback = thenCallback;
			if (resolved) {
				callback.apply({}, args);
			}
		};

		/** 
		 * Resolves the promise with a success result.
		 * @memberOf Promise
		 * @param {...*} arguments The arguments for resolution.
		*/
		self.resolve = function () {
			args = arguments;
			resolved = true;
			if (callback) {
				callback.apply({}, args);
			}
		};
	}

	JSL.classes.Promise = Promise;

}(JSL));