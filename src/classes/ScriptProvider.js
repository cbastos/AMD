var JSL = JSL || { classes: {} };
(function (JSL) {
	"use strict";

	/** 
	 * @class The script manager is the responsible to retrieve scripts, downloading it if they weren't downloaded previously.
	 * @constructor ScriptProvider
	 */
	function ScriptProvider() {
		this._scriptPaths = {};
	}

	ScriptProvider.prototype._pathResolver = function (reference) {
		return reference.from;
	};

	/** 
	 * Registers a new script definition in the script manager.
	 * @memberOf ScriptProvider
	 * @param {Object} pathReference The script path reference.
	 * @throws The script reference hasn't an "id" or "from".
	*/
	ScriptProvider.prototype.register = function (pathReference) {
		validate(pathReference);
		this._scriptPaths[pathReference.id] = pathReference;
	};

	function validate(pathReference) {
		var isValid = pathReference && typeof (pathReference.id) === "string" && typeof (pathReference.from) !== "undefined";
		if (!isValid) {
			throw "The reference has wrong properties. Try to set an script \"id\" (string) and a \"from\". (Wrong reference: " + JSON.stringify(pathReference) + ").";
		}
	}

	/** 
	 * Downloads an array of scripts.
	 * @memberOf ScriptProvider
	 * @param {String[]} identifiers Identifiers of scripts you want to download.
	 * @returns {Promise} The promise of be downloaded.
	 * @throws The resolved url is not a string.
	 * @throws The script has not been registered.
	*/
	ScriptProvider.prototype.download = function (identifiers) {
		var self = this,
			promise = new JSL.classes.Promise();

		for (var i = 0, l = identifiers.length; i < l; ++i) {
			getDownloadPromiseFor.call(this, identifiers[i]).then(checkAreDownladed);
		}

		function checkAreDownladed(id) {
			identifiers.splice(identifiers.indexOf(id), 1);
			if (identifiers.length === 0) {
				promise.resolve();
			}
		}

		return promise;
	};

	function getDownloadPromiseFor(element) {
		var self = this;
		if (typeof (element) === "string") {
			return getScript.call(self, element);
		} else {
			return downloadScriptsInOrder.call(self, element[0], element);
		}
	}

	function downloadScriptsInOrder(id, scriptsNames) {
		var self = this,
			promise = new JSL.classes.Promise();
		if (scriptsNames.length === 0) {
			promise.resolve(id);
		} else {
			var firstScriptIdentifier = scriptsNames[0];
			getScript.call(self, firstScriptIdentifier).then(function () {
				scriptsNames.shift();
				downloadScriptsInOrder.call(self, id, scriptsNames).then(promise.resolve);
			});
		}
		return promise;
	}

	function getScript(scriptIdentifier) {
		var self = this,
			promise = new JSL.classes.Promise(),
			existingScript = getFirstScriptInDom(scriptIdentifier);
		if (existingScript === undefined) {
			downloadScript({ id: scriptIdentifier, scriptPath: getPathFor.call(self, scriptIdentifier), }).then(function () {
				promise.resolve(scriptIdentifier);
			});
		} else if (existingScript.getAttribute("data-loaded") === "true") {
			promise.resolve(scriptIdentifier);
		} else {
			existingScript.addEventListener('load', function () {
				promise.resolve(scriptIdentifier);
			});
		}
		return promise;
	}

	function getFirstScriptInDom(scriptIdentifier) {
		var scripts = document.getElementsByTagName("script");
		for (var i in scripts) {
			var isTheFirstScriptWithThisIdentifier = (typeof scripts[i]) === "object" && scripts[i].getAttribute("data-identifier") === scriptIdentifier;
			if (isTheFirstScriptWithThisIdentifier) {
				return scripts[i];
			}
		}
	}

	function downloadScript(downloadScriptConfig) {
		var promise = new JSL.classes.Promise(),
			script = document.createElement('script');

		script.setAttribute("data-identifier", downloadScriptConfig.id);
		script.addEventListener('load', function () {
			script.setAttribute("data-loaded", true);
			promise.resolve();
		}, false);
		script.src = downloadScriptConfig.scriptPath;

		document.head.appendChild(script);
		return promise;
	}

	function getPathFor(id) {
		var from = this._scriptPaths[id];
		if (typeof from !== "undefined") {
			var url = this._pathResolver(from);
			if (typeof url === "string") {
				return url;
			}
			throw "The resolved url for \"" + id + "\"is not a string.";
		}
		throw "The \"" + id + "\" from hasn't been added.";
	}

	/**
	 * This callback will process the script path reference.
	 * @callback pathResolver
	 * @param {Object} pathReference The script path reference.
	 * @returns {String} script url resolved.
	 */

	/**
	 * Configures the path resolver that process the script path reference.
	 * @memberOf ScriptProvider
	 * @param {pathResolver} pathResolver - The new path resolver that will process the script path reference.
	 */
	ScriptProvider.prototype.setPathResolver = function (pathResolver) {
		if (typeof (pathResolver) != "function") {
			throw "The configured pathResolver is not a function";
		}
		this._pathResolver = pathResolver;
	};

	JSL.classes.ScriptProvider = ScriptProvider;

}(JSL));