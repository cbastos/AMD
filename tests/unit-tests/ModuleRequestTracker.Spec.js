describe("The starting modules tracker", function () {
	var startingModulesTracker,
		some_module_identifier = "Some.NameSpace.To.Module.Identifier";

	beforeEach(function () {
		startingModulesTracker = new AMD.classes.ModuleRequestTracker();
	});

	it("on instantiation, initializes the dictionary of tracked modules", function () {
		var initial_tracked_modules_dictionary = {};

		expect(startingModulesTracker.startingModules).toEqual(initial_tracked_modules_dictionary);

	});

	it("may add a module you want to track his start process", function () {
		var some_start_request_promise_fake = { then: function () { }, resolve: function () { } },
			some_start_request = { id: some_module_identifier, moduleRequestPromise: some_start_request_promise_fake };

		startingModulesTracker.registerModuleRequest(some_start_request);

		expect(startingModulesTracker.startingModules[some_module_identifier]).toEqual([some_start_request_promise_fake]);

	});

	it("may get the number of start requests for a module", function () {
		var some_tracked_request = [{}];
		startingModulesTracker.startingModules[some_module_identifier] = some_tracked_request;

		var number_of_starting_modules = startingModulesTracker.getNumberOfRequestsFor(some_module_identifier);

		expect(number_of_starting_modules).toEqual(some_tracked_request.length);

	});

	it("may know if any start request of a module is registered", function () {
		startingModulesTracker.startingModules[some_module_identifier] = [{}];

		var has_starting_modules = startingModulesTracker.hasRequestsRegisteredFor(some_module_identifier);

		expect(has_starting_modules).toBe(true);

	});

	it("may retrieve the first start request for a module", function () {
		var some_start_request = {};
		startingModulesTracker.startingModules[some_module_identifier] = [some_start_request];

		var first_start_registered_in_tracker = startingModulesTracker.getFirstModuleRequestFor(some_module_identifier);

		expect(first_start_registered_in_tracker).toBe(some_start_request);

	});

	it("may delete the first start request for a module", function () {
		var first_start_request = {};
		startingModulesTracker.startingModules[some_module_identifier] = [first_start_request];

		startingModulesTracker.deleteFirstModuleRequestFor(some_module_identifier);

		expect(startingModulesTracker.startingModules[some_module_identifier]).toEqual([]);

	});

});