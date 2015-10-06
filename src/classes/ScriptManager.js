var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @constructor ScriptManager
	 * @class The script manager is the responsible to retrieve the scripts, downloading it if they weren't downloaded yet.
	 */
	function ScriptManager() {
		var self = this,
            scriptPaths = {},
            pathResolver = function (reference) {
            	return reference.from;
            };

		/** 
		 * Downloads an array of scripts.
		 * @memberOf ScriptManager
		 * @param {String[]} identifiers Identifiers of scripts you want to download.
		 * @returns {Promise} The promise of be downloaded.
		*/
		self.download = function (identifiers) {
			var promise = new AMD.classes.Promise();

			for (var i = 0, l = identifiers.length; i < l; ++i) {
				var element = identifiers[i];
				if (typeof (element) === "string") {
					self.getScript({
						id: element,
						scriptPath: self.getPathFor(element),
					}).then(checkAreDownloaded);
				} else {
					downloadScriptsInOrder(element[0], element).then(checkAreDownloaded);
				}
			}

			function checkAreDownloaded(id) {
				identifiers.splice(identifiers.indexOf(id), 1);
				if (identifiers.length === 0) {
					promise.resolve();
				}
			}

			return promise;
		};

		function downloadScriptsInOrder(id, scriptsNames) {
			var promise = new AMD.classes.Promise();
			if (scriptsNames.length === 0) {
				promise.resolve(id);
			} else {
				self.getScript({
					id: scriptsNames[0],
					scriptPath: self.getPathFor(scriptsNames[0]),
				}).then(function () {
					scriptsNames.shift();
					downloadScriptsInOrder(id, scriptsNames).then(promise.resolve);
				});
			}
			return promise;
		}

		/** 
		 * Registers a new script definition in the script manager.
		 * @memberOf ScriptManager
		 * @param {Object} pathReference The script path reference.
		 * @throws {WrongScriptReference} The script reference hasn't an "id" or "from".
		*/
		self.register = function (pathReference) {
			validate(pathReference);
			scriptPaths[pathReference.id] = pathReference;
		};

		function validate(pathReference) {
			var isValid = pathReference && typeof (pathReference.id) === "string" && typeof (pathReference.from) !== "undefined";
			if (!isValid) {
				throw "The reference has wrong properties. Try to set an script \"id\" (string) and a \"from\". (Wrong reference: " + JSON.stringify(pathReference) + ").";
			}
		}

		/** 
		 * Gets a script path through his identifier.
		 * @memberOf ScriptManager
		 * @param {String} id The script identifier.
		 * @returns {String} The path of the script.
		 * @throws {WrongUrlResolved} The resolved url is not a string.
		 * @throws {ScriptNotRegistered} The script has not been registered.
		*/
		self.getPathFor = function (id) {
			var from = scriptPaths[id];
			if (typeof (from) !== "undefined") {
				var url = pathResolver(from);
				if (typeof (url) === "string") {
					return url;
				}
				throw "The resolved url for \"" + id + "\"is not a string.";
			}
			throw "The \"" + id + "\" from hasn't been added.";
		};

		/**
		 * This callback type is called `pathResolver`.
		 * @callback pathResolver
		 * @param {Object} pathReference The script path reference.
		 */

		/**
         * Configures the path resolver that process the script path reference.
         * @memberOf ScriptManager
	     * @param {pathResolver} newPathResolver - The new path resolver that will process the script path reference.
		 */
		self.setPathResolver = function (newPathResolver) {
			if (typeof (newPathResolver) != "function") {
				throw "The configured pathResolver is not a function";
			}
			pathResolver = newPathResolver;
		};

		/**
		 * Retrieves a script.
		 * @memberOf ScriptManager
		 * @param {Object} downloadScriptConfig The script config with the 'id' and 'scriptPath' of the script.
		 * @returns {Promise} The promise of be retrieved the script.
		 */
		self.getScript = function (downloadScriptConfig) {
			var promise = new AMD.classes.Promise(),
				existingScript = getFirstScriptInDom(downloadScriptConfig.id);
			if (existingScript === undefined) {
				downloadScript(downloadScriptConfig).then(function () { promise.resolve(downloadScriptConfig.id); });
			} else if (existingScript.getAttribute("data-loaded") === "true") {
				promise.resolve(downloadScriptConfig.id);
			} else {
				existingScript.addEventListener('load', function () { promise.resolve(downloadScriptConfig.id); });
			}
			return promise;
		};

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
			var promise = new AMD.classes.Promise(),
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

	}

	AMD.classes.ScriptManager = ScriptManager;

}(AMD));