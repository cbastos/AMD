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
