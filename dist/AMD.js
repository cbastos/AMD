var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @class The factory for creating dependencies objects.
	 * @constructor AMD.classes.DependenciesFactory
	 */
	function DependenciesFactory() {

	}

	/** 
	 * Fills a the dependencies template object with his dependencies.
     * @memberOf DependenciesFactory
     * @param {Object} dependenciesTemplate The template is an object with dependency identifiers (as properties of the template object) to be replaced for the dependencies.
     * @param {Object} defaultDependencies Default dependencies for all elements.
     * @param {Function} instantiate Instantiator callback.
     * @returns {Object} Object with dependencies as properties.
    */
	DependenciesFactory.prototype.createFrom = function (dependenciesTemplate, defaultDependencies, instantiate) {
		var dependencies = dependenciesTemplate || {};
		fill(dependencies, instantiate);
		for (var member in defaultDependencies) {
			dependencies[member] = defaultDependencies[member];
		}
		return dependencies;
	};

	function fill(dependenciesTemplate, instantiate) {
		for (var property in dependenciesTemplate) {
			if (typeof (dependenciesTemplate[property]) === "string") {
				dependenciesTemplate[property] = get(dependenciesTemplate[property], instantiate);
			} else if (Array.isArray(dependenciesTemplate[property])) {
				dependenciesTemplate[property] = get(dependenciesTemplate[property][0], instantiate);
			} else {
				fill(dependenciesTemplate[property], instantiate);
			}
		}
	}

	function get(globalVariablePath, instantiate) {
		var nameSpacePathParts = globalVariablePath.split("."),
			nameSpacePath = {};
		for (var i = 0, l = nameSpacePathParts.length; i < l; i++) {
			if (i === 0) {
				nameSpacePath = window[nameSpacePathParts[i]];
			} else {
				nameSpacePath = nameSpacePath[nameSpacePathParts[i]];
			}
		}

		if (nameSpacePath && nameSpacePath.from) {
			nameSpacePath = instantiate(nameSpacePath);
		}
		return nameSpacePath;
	}

	AMD.classes.DependenciesFactory = DependenciesFactory;

}(AMD));
var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @class The module manager.
	 * @constructor ModuleManager
	 */
	function ModuleManager(scriptManager) {
		var self = this,
            defaultDependencies = {},
            startingModulesTracker = new AMD.classes.ModuleRequestTracker(),
			dependenciesFactory = new AMD.classes.DependenciesFactory();

		/** 
		 * Sets the default dependencies object.
		 * @memberOf ModuleManager
		 * @param {Object} newDefaultDependencies The object with the default dependencies.
		*/
		self.setDefaultDependencies = function (newDefaultDependencies) {
			defaultDependencies = newDefaultDependencies;
		};

		/** 
		 * Register a new módule
		 * @memberOf ModuleManager
		 * @param {Object} moduleRegisterInfo The module register information with identifier, definition, etc.
		*/
		self.register = function (moduleRegisterInfo) {
			validate(moduleRegisterInfo);
			if (!isLoaded(moduleRegisterInfo.id)) {
				registerOnWindow(moduleRegisterInfo);
			}
		};

		function validate(moduleInfo) {
			var isNotValid = (moduleInfo === undefined || typeof (moduleInfo.id) !== "string" || typeof (moduleInfo.from) !== "function");
			if (isNotValid) {
				throw "You're trying to register an element without 'id' identifier or a 'from' origin. You must specify an identifier \"id\" (string) and a from \"from\" (a function to get the module or a path (string) where is placed the element), and you can optionally establish \"dependencies\" of the element.";
			}
		}

		function registerOnWindow(module) {
			var nameSpacePathParts = module.id.split("."),
                nameSpacePath = window;

			for (var i = 0, l = nameSpacePathParts.length - 1; i < l; i++) {
				if (!nameSpacePath[nameSpacePathParts[i]]) {
					nameSpacePath = nameSpacePath[nameSpacePathParts[i]] = {};
				} else {
					nameSpacePath = nameSpacePath[nameSpacePathParts[i]];
				}
			}
			nameSpacePath[nameSpacePathParts[nameSpacePathParts.length - 1]] = module;
		}

		/** 
		 * Retrieves a module.
		 * @memberOf ModuleManager
		 * @param {Object} module The module.
		 * @returns {Promise} Promise to be retrieved.
		*/
		self.get = function (module) {
			var promise = new AMD.classes.Promise(),
                moduleIdentifier = module.id;

			startingModulesTracker.registerModuleRequest({ id: moduleIdentifier, moduleRequestPromise: promise });

			getModule(moduleIdentifier).then(function (module) {
				download(module.dependencies).then(function () {
					instanceStartingModulesOf(moduleIdentifier);
				});
			});

			return promise;
		};

		function download(dependencies) {
			var promise = new AMD.classes.Promise();

			var elementsToDownload = getElementsToDownload(dependencies);
			if (elementsToDownload.length > 0) {
				scriptManager.download(elementsToDownload).then(promise.resolve);
			} else {
				promise.resolve();
			}
			return promise;
		}

		function getElementsToDownload(element) {
			var elementsToDownload = [];
			for (var p in element) {
				var member = element[p];
				if (typeof (member) === "string" && !isLoaded(member)) {
					elementsToDownload.push(member);
				} else if (Array.isArray(member)) {
					var downloadInOrder = [];
					for (var i = 0, l = member.length; i < l; ++i) {
						if (!isLoaded(member[i])) {
							downloadInOrder.push(member[i]);
						}
					}
					elementsToDownload.push(downloadInOrder);
				} else if (typeof (member) === "object") {
					elementsToDownload = elementsToDownload.concat(getElementsToDownload(member));
				}
			}
			return elementsToDownload;
		}

		function isLoaded(globalVariablePath) {
			var nameSpacePathParts = globalVariablePath.split(".");
			var nameSpacePath = {};
			for (var i = 0, l = nameSpacePathParts.length; i < l; i++) {
				if (i === 0) {
					nameSpacePath = window[nameSpacePathParts[i]];
				} else {
					nameSpacePath = nameSpacePath[nameSpacePathParts[i]];
				}
				if (typeof (nameSpacePath) === "undefined") {
					return false;
				}
			}
			return true;
		}

		function getModule(moduleIdentifier) {
			var promise = new AMD.classes.Promise();

			if (isLoaded(moduleIdentifier)) {
				promise.resolve(getVar(moduleIdentifier));
			} else if (startingModulesTracker.getNumberOfRequestsFor(moduleIdentifier) <= 1) {
				scriptManager.getScript({
					id: moduleIdentifier,
					scriptPath: scriptManager.getPathFor(moduleIdentifier)
				}).then(function () {
					promise.resolve(getVar(moduleIdentifier));
				});
			}
			return promise;
		}

		function getVar(globalVariablePath) {
			var nameSpacePathParts = globalVariablePath.split("."),
                target = {};
			for (var i = 0, l = nameSpacePathParts.length; i < l; i++) {
				if (i === 0) {
					target = window[nameSpacePathParts[i]];
				} else {
					target = target[nameSpacePathParts[i]];
				}
			}
			return target;
		}

		function instanceStartingModulesOf(moduleIdentifier) {
			var module = getVar(moduleIdentifier);
			while (startingModulesTracker.hasRequestsRegisteredFor(moduleIdentifier)) {
				var moduleRequestPromise = startingModulesTracker.getFirstModuleRequestFor(moduleIdentifier);
				startingModulesTracker.deleteFirstModuleRequestFor(moduleIdentifier);
				if (module && module.from) {
					instantiate(module, moduleRequestPromise, defaultDependencies);
				} else {
					moduleRequestPromise.resolve(getVar(moduleIdentifier));
				}
			}
		}

		function instantiate(module, moduleRequestPromise, defaultDependencies) {
			var hasStartingDataCallBak = moduleRequestPromise && typeof (moduleRequestPromise.resolve) === "function",
                dependencies = dependenciesFactory.createFrom(module.dependencies, defaultDependencies, instantiate),
                instance = module.from(dependencies);

			if (hasStartingDataCallBak) {
				moduleRequestPromise.resolve(instance);
			}
			return instance;
		}
	}

	AMD.classes.ModuleManager = ModuleManager;

}(AMD));
var AMD = AMD || { classes: {} };
(function (AMD) {
    "use strict";
    
	/** 
	 * @class The module retrieving request tracker.
	 * @constructor ModuleRequestTracker
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
	 * @returns {Promise} The first request to retrieve a module.
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

    AMD.classes.ModuleRequestTracker = ModuleRequestTracker;

}(AMD));
var AMD = AMD || { classes: {} };
(function (AMD) {
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

	AMD.classes.Promise = Promise;

}(AMD));
var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @class The script manager is the responsible to retrieve scripts, downloading it if they weren't downloaded previously.
	 * @constructor ScriptManager
	 */
	function ScriptManager() {
		this._scriptPaths = {};
	}

	ScriptManager.prototype._pathResolver = function (reference) {
		return reference.from;
	};

	/** 
	 * Downloads an array of scripts.
	 * @memberOf ScriptManager
	 * @param {String[]} identifiers Identifiers of scripts you want to download.
	 * @returns {Promise} The promise of be downloaded.
	*/
	ScriptManager.prototype.download = function (identifiers) {
		var self = this,
			promise = new AMD.classes.Promise();

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
			return self.getScript({ id: element, scriptPath: self.getPathFor(element) });
		} else {
			return downloadScriptsInOrder.call(self, element[0], element);
		}
	}

	function downloadScriptsInOrder(id, scriptsNames) {
		var self = this,
			promise = new AMD.classes.Promise();
		if (scriptsNames.length === 0) {
			promise.resolve(id);
		} else {
			var firstScriptIdentifier = scriptsNames[0];
			self.getScript({
				id: firstScriptIdentifier,
				scriptPath: self.getPathFor(firstScriptIdentifier),
			}).then(function () {
				scriptsNames.shift();
				downloadScriptsInOrder.call(self, id, scriptsNames).then(promise.resolve);
			});
		}
		return promise;
	}

	/** 
	 * Registers a new script definition in the script manager.
	 * @memberOf ScriptManager
	 * @param {Object} pathReference The script path reference.
	 * @throws The script reference hasn't an "id" or "from".
	*/
	ScriptManager.prototype.register = function (pathReference) {
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
	 * Gets a script path through his identifier.
	 * @memberOf ScriptManager
	 * @param {String} id The script identifier.
	 * @returns {String} The path of the script.
	 * @throws The resolved url is not a string.
	 * @throws The script has not been registered.
	*/
	ScriptManager.prototype.getPathFor = function (id) {
		var from = this._scriptPaths[id];
		if (typeof from !== "undefined") {
			var url = this._pathResolver(from);
			if (typeof url === "string") {
				return url;
			}
			throw "The resolved url for \"" + id + "\"is not a string.";
		}
		throw "The \"" + id + "\" from hasn't been added.";
	};

	/**
	 * This callback will process the script path reference.
	 * @callback pathResolver
	 * @param {Object} pathReference The script path reference.
	 * @returns {String} script url resolved.
	 */

	/**
	 * Configures the path resolver that process the script path reference.
	 * @memberOf ScriptManager
	 * @param {pathResolver} pathResolver - The new path resolver that will process the script path reference.
	 */
	ScriptManager.prototype.setPathResolver = function (pathResolver) {
		if (typeof (pathResolver) != "function") {
			throw "The configured pathResolver is not a function";
		}
		this._pathResolver = pathResolver;
	};

	/**
	 * Retrieves a script.
	 * @memberOf ScriptManager
	 * @param {Object} downloadScriptConfig The script config with the 'id' and 'scriptPath' of the script.
	 * @returns {Promise} The promise of be retrieved the script.
	 */
	ScriptManager.prototype.getScript = function (downloadScriptConfig) {
		var promise = new AMD.classes.Promise(),
			existingScript = getFirstScriptInDom(downloadScriptConfig.id);
		if (existingScript === undefined) {
			downloadScript(downloadScriptConfig).then(function () {
				promise.resolve(downloadScriptConfig.id);
			});
		} else if (existingScript.getAttribute("data-loaded") === "true") {
			promise.resolve(downloadScriptConfig.id);
		} else {
			existingScript.addEventListener('load', function () {
				promise.resolve(downloadScriptConfig.id);
			});
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

	AMD.classes.ScriptManager = ScriptManager;

}(AMD));
/** 
 * The AMD (asynchronous module definition) manager.
 * @namespace AMD
*/
var AMD = AMD || { classes: {} };
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
	 * Change configuration of the AMD manager. You can configure a new path resolver or the default dependencies for all elements.
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