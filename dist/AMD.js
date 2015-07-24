var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.DependenciesFactory = DependenciesFactory;

    function DependenciesFactory() {

    }

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
        var nameSpacePathParts = globalVariablePath.split(".");
        var nameSpacePath = {};
        for (var i = 0, l = nameSpacePathParts.length; i < l; i++) {
            if (i == 0) {
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

}(AMD));

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

var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.StartingModulesTracker = StartingModulesTracker;
    
    function StartingModulesTracker() {
        this.startingModules = {};
    }

    StartingModulesTracker.prototype.addModuleDataStart = function (idModule, dataStart) {
        this.startingModules[idModule] = this.startingModules[idModule] || [];
        this.startingModules[idModule].push(dataStart);
    };

    StartingModulesTracker.prototype.getNumerOfStartingModulesFor = function (idModule) {
        return this.startingModules[idModule] ? this.startingModules[idModule].length : 0;
    };

    StartingModulesTracker.prototype.hasStartingModules = function (idModule) {
        return this.startingModules[idModule] && this.startingModules[idModule].length !== 0;
    };

    StartingModulesTracker.prototype.getFirstDataStart = function (idModule) {
        return this.startingModules[idModule][0];
    };

    StartingModulesTracker.prototype.deleteFirstDataStart = function (module) {
        this.startingModules[module].splice(0, 1);
    };

}(AMD));

var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.Promise = Promise;

    function Promise() {
        var self = this;
        var resolved = false, callback, args;

        self.then = function (clback) {
            callback = clback;
            if (resolved) {
                callback.apply({}, args);
            }
        };
        self.done = function () {
            args = arguments;
            resolved = true;
            if (callback) {
                callback.apply({}, args);
            }
        };
    }
}(AMD));

var AMD = AMD || {};
(function (framework) {
    "use strict";
    framework.classes = framework.classes || {};
    framework.classes.ScriptManager = ScriptManager;

    function ScriptManager() {
        var self = this,
            scriptPaths = {},
            pathResolver = function (reference) {
                return reference.from;
            };

        self.download = function (identifiers) {
            var promise = new framework.classes.Promise();

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
                    promise.done();
                }
            }

            return promise;
        };

        self.register = function (pathReference) {
            if (!isValid(pathReference)) {
                throw "The reference has wrong properties. Try to set an \"module\" or \"library\" (string) and a \"from\". (Wrong reference: " + JSON.stringify(pathReference) + ").";
            }
            scriptPaths[pathReference.id] = pathReference;
        };

        function isValid(pathReference) {
            return pathReference &&
                   typeof (pathReference.id) === "string" &&
                   typeof (pathReference.from) !== "undefined";
        };

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

        self.setPathResolver = function (newPathResolver) {
            if (typeof (newPathResolver) != "function") {
                throw "The configured pathResolver is not a function";
            }
            pathResolver = newPathResolver;
        };

        function downloadScriptsInOrder(id, scriptsNames) {
            var promise = new framework.classes.Promise();
            if (scriptsNames.length == 0) {
                promise.done(id);
            } else {
                self.getScript({
                    id: scriptsNames[0],
                    scriptPath: self.getPathFor(scriptsNames[0]),
                }).then(function () {
                    scriptsNames.shift();
                    downloadScriptsInOrder(id, scriptsNames).then(promise.done);
                });
            }
            return promise;
        };

        self.getScript = function (downloadScriptConfig) {
            var promise = new framework.classes.Promise();
            var existingScript = getScriptsByAttributeValue("data-identifier", downloadScriptConfig.id)[0];
            if (existingScript === undefined) {
                downloadScript(downloadScriptConfig).then(function () { promise.done(downloadScriptConfig.id) });
            } else {
                if (existingScript.getAttribute("data-loaded") === "true") {
                    promise.done(downloadScriptConfig.id);
                } else {
                    existingScript.addEventListener('load', function () { promise.done(downloadScriptConfig.id) });
                }
            }
            return promise;
        };

        function getScriptsByAttributeValue(attribute, value) {
            var scripts = document.getElementsByTagName("script");
            var match = new Array();
            for (var i in scripts) {
                if ((typeof scripts[i]) === "object") {
                    if (scripts[i].getAttribute(attribute) === value) {
                        match.push(scripts[i]);
                    }
                }
            }
            return match;
        };

        function downloadScript(downloadScriptConfig) {
            var promise = new framework.classes.Promise();
            var script = document.createElement('script');
            script.setAttribute("data-identifier", downloadScriptConfig.id);
            script.addEventListener('load', function () {
                script.setAttribute("data-loaded", true);
                promise.done();
            }, false);
            script.src = downloadScriptConfig.scriptPath;

            document.head.appendChild(script);
            return promise;
        }

    }

}(AMD));

var AMD = AMD || {};
(function (framework) {
    "use strict";
    var scriptManager = new framework.classes.ScriptManager(),
        moduleManager = new framework.classes.ModuleManager(scriptManager);

    framework.set = function (element) {
        if (typeof (element.from) === "function") {
            moduleManager.register(element);
        } else {
            scriptManager.register(element);
        }
    };
    framework.get = moduleManager.get;
    framework.config = function (configDetails) {
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