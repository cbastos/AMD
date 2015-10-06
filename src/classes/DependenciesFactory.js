var AMD = AMD || { classes: {} };
(function (AMD) {
	"use strict";

	/** 
	 * @constructor DependenciesFactory
	 * @class The factory for creating dependencies objects.
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