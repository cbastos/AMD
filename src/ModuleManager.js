var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.ModuleManager = ModuleManager;

    function ModuleManager(scriptManager) {
        var self = this,
            defaultDependencies = {},
            startingModulesTracker = new framework.classes.StartingModulesTracker();

        self.setDefaultDependencies = function (newDefaultDependencies) {
            defaultDependencies = newDefaultDependencies;
        };

        self.register = function (moduleRegisterInfo) {
            validate(moduleRegisterInfo);
            if (!isLoaded(moduleRegisterInfo.id)) {
                registerOnWindow(moduleRegisterInfo);
            }
        };

        function validate(moduleRegisterInfo) {
            var isNotValid = (moduleRegisterInfo === undefined
                                || typeof (moduleRegisterInfo.id) !== "string"
                                || typeof (moduleRegisterInfo.from) !== "function");
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
        self.get = function (module) {
            var promise = new framework.classes.Promise(),
                idModule = module.id;

            startingModulesTracker.addModuleDataStart(idModule, { startCallBack: promise.done });

            self.getModule(idModule).then(function (module) {
                download(module.dependencies).then(function () {
                    instanceStartingModulesOf(idModule);
                });
            });

            return promise;
        };

        function download(dependencies) {
            var promise = new framework.classes.Promise();

            var elementsToDownload = getElementsToDownload(dependencies);
            if (elementsToDownload.length > 0) {
                scriptManager.download(elementsToDownload).then(promise.done)
            } else {
                promise.done();
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
                if (i == 0) {
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

        self.getModule = function (idModule) {
            var promise = new framework.classes.Promise();

            if (isLoaded(idModule)) {
                promise.done(getVar(idModule));
            } else if (startingModulesTracker.getNumerOfStartingModulesFor(idModule) <= 1) {
                scriptManager.getScript({
                    id: idModule,
                    scriptPath: scriptManager.getPathFor(idModule)
                }).then(function () {
                    promise.done(getVar(idModule));
                });
            }
            return promise;
        };

        //TODO: quitar de aquí, está duplicada  en dependenciesfactory
        function getVar(globalVariablePath) {
            var nameSpacePathParts = globalVariablePath.split("."),
                target = {};
            for (var i = 0, l = nameSpacePathParts.length; i < l; i++) {
                if (i == 0) {
                    target = window[nameSpacePathParts[i]];
                } else {
                    target = target[nameSpacePathParts[i]];
                }
            }
            return target;
        }

        function instanceStartingModulesOf(idModule) {
            var module = getVar(idModule);
            while (startingModulesTracker.hasStartingModules(idModule)) {
                var startingData = startingModulesTracker.getFirstDataStart(idModule);
                startingModulesTracker.deleteFirstDataStart(idModule);
                if (module && module.from) {
                    instantiate(module, startingData, defaultDependencies);
                } else {
                    startingData.startCallBack(getVar(idModule));
                }
            }
        }

        function instantiate(module, startingData, defaultDependencies) {
            var hasStartingDataCallBak = startingData && typeof (startingData.startCallBack) === "function",
                dependenciesFactory = new framework.classes.DependenciesFactory(),
                dependencies = dependenciesFactory.createFrom(module.dependencies, defaultDependencies, instantiate),
                instance = module.from(dependencies);

            if (hasStartingDataCallBak) {
                startingData.startCallBack(instance);
            }
            return instance;
        };
    }

}(AMD));
