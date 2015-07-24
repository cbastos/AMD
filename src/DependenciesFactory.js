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
