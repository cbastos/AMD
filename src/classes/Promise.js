var AMD = AMD || {};
(function (AMD) {
	"use strict";
	AMD.classes = AMD.classes || {};
	AMD.classes.Promise = Promise;

	/** 
	 * @constructor Promise
	 * @class The promise.
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
}(AMD));
