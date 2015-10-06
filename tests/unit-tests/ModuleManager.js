describe("The module manager", function () {
	var moduleManager;

	beforeEach(function () {
		var some_script_manager = function () { };
		moduleManager = new AMD.classes.moduleManager(some_script_manager);
	});

});