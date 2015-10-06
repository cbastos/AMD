describe("The script manager", function () {
	var scriptManager;

	beforeEach(function () {
		scriptManager = new AMD.classes.ScriptManager();
	});


	describe("when registering a new path reference", function () {

		xit("may register a valid path reference", function () {
			var some_valid_path_reference = {
				id: "Some.Identifier",
				from: { path: "/Some/irrelevant/path/to/file.js" }
			};

			scriptManager.register(some_valid_path_reference);

		});

		it("throws a descriptive exception if has a wrong identifier", function () {
			var some_path_reference_without_id = {
				//-> missing "id"
				from: { path: "/some/path/to/file.js" }
			};

			expect_throws_a_wrong_reference_exception_when_register(some_path_reference_without_id);

		});

		it("throws a descriptive exception if has a wrong path reference object.", function () {
			var some_path_reference_without_from = {
				id: "Some.Identifier",
				//-> missing "from"
			};

			expect_throws_a_wrong_reference_exception_when_register(some_path_reference_without_from);

		});

		function expect_throws_a_wrong_reference_exception_when_register(path_reference) {

			expect(function () {
				scriptManager.register(path_reference);
			}).toThrow("The reference has wrong properties. Try to set an script \"id\" (string) and a \"from\". (Wrong reference: " + JSON.stringify(path_reference) + ").");

		}

	});

	
	describe("when configuring the path resolver", function () {

		it("throws a descriptive error when you try to  configure a path resolver that is not a function", function () {
			var some_wrong_path_resolver; //-> undefined is not a function 

			expect(function () {
				scriptManager.setPathResolver(some_wrong_path_resolver);
			}).toThrow("The configured pathResolver is not a function");

		});

		xit("may register a new path resolver", function () {
			var some_path_resolver = function (pathReference) { return pathReference.from; }; //-> undefined is not a function

			scriptManager.setPathResolver(some_path_resolver);

		});
	});

});