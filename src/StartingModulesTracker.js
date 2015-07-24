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
