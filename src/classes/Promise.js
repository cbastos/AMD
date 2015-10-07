var JSL = JSL || { classes: {} };
(function (JSL) {
	"use strict";

	/** 
	 * @class The promise.
	 * @constructor Promise
	 */
	function Promise() {
		this.resolved = false;
	}

	/** 
	 * Sets the callback function that must be executed when the promise is resolved with a success result.
	 * @memberOf Promise
	 * @param {Object} thenCallback The callback that must be executed when the promise be resolved.
	*/
	Promise.prototype.then = function (thenCallback) {
		this.callback = thenCallback;
		if (this.resolved) {
			this.callback.apply({}, this.args);
		}
	};

	/** 
	 * Resolves the promise with a success result.
	 * @memberOf Promise
	 * @param {...*} arguments The arguments for resolution.
	*/
	Promise.prototype.resolve = function () {
		this.args = arguments;
		this.resolved = true;
		if (this.callback) {
			this.callback.apply({}, this.args);
		}
	};

	JSL.classes.Promise = Promise;

}(JSL));