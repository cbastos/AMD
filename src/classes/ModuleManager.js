var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @constructor ModuleManager
	 * @class The module manager.
	 */
	function ModuleManager(scriptManager) {
		var self = this,
            defaultDependencies = {},
            startingModulesTracker = new AMD.classes.ModuleRequestTracker();

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
		*/
		self.get = function (module) {
			var promise = new AMD.classes.Promise(),
                moduleIdentifier = module.id;

			//TODO: el segundo parámetro siempre es una promesa, quitar dataclump
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
                dependenciesFactory = new AMD.classes.DependenciesFactory(),
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