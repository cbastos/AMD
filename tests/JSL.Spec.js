describe("The JSL Framework", function () {
	"use strict";

	var JQUERY_PATH = "../vendor/jquery/jquery-1.8.2.js";

	describe("when inspecting JSL objects facades", function () {

		describe("when inspecting JSL global variable", function () {

			it("shows JSL utilities", function () {
				expect(typeof (JSL.set) === "function").toBeTruthy();
				expect(typeof (JSL.config) === "function").toBeTruthy();
				expect(typeof (JSL.get) === "function").toBeTruthy();
			});

		});

		describe("when inspecting module dependencies", function () {

			it("can set a default dependencies", function () {
				var defaultDependencies = { handle: function () { } };
				JSL.config({
					dependencies: defaultDependencies
				});
				JSL.set({
					id: "ModuleForShowingSandBoxFacade",
					from: function (dependencies) {

						expect(dependencies).toEqual(defaultDependencies);

					}
				});
				JSL.get({ id: "ModuleForShowingSandBoxFacade" });
			});

		});

	});

	describe("when registering modules", function () {

		it("may register a module only the first time", function () {
			var returnedValue = "doSomething_Module5_Executed";
			JSL.set({ id: "Module5", from: function () { return returnedValue; } });
			JSL.set({ id: "Module5", from: function () { return "WRONG_VALUE"; } });

			JSL.get({ id: "Module5" }).then(function (returnedData) {

				expect(returnedData).toEqual(returnedValue);

			});
		});

		it("fails when module is registered without module", function () {
			expect(function () {
				JSL.set({
					// --> Missing  "id".
					from: function () { }
				});
			}).toThrow("You're trying to register an element without 'id' identifier or a 'from' origin. You must specify an identifier \"id\" (string) and a from \"from\" (a function to get the module or a path (string) where is placed the element), and you can optionally establish \"dependencies\" of the element.");
		});

		it("fails when module is registered without from", function () {
			expect(function () {
				JSL.set({
					id: "IrrelevantId",
					// --> Missing "from".
				});
			}).toThrow('The reference has wrong properties. Try to set an script \"id\" (string) and a "from". (Wrong reference: {"id":"IrrelevantId"}).');
		});

		it("fails if the module needs a library that isn't registered previously", function () {
			JSL.set({
				id: "ModuleWithNotFoundLib",
				dependencies: { some_dependency: "NonExistingLibId" },
				from: function () { }
			});

			expect(function () {
				JSL.get({ id: "ModuleWithNotFoundLib" });
			}).toThrow("The \"NonExistingLibId\" from hasn't been added.");
		});

	});

	describe("when registering a module using his path", function () {

		it("may be retrieved and its functions may be accessed", function (done) {
			JSL.set({ id: "SampleModule", from: "./Fixtures/SampleModule.js" });

			JSL.get({ id: "SampleModule" }).then(function (SampleModule) {

				var sampleModule = new SampleModule();
				expect(typeof (sampleModule.someMethod) === "function").toBeTruthy();
				done();

			});
		});

		it("fails if doesn't have a correct identifier", function () {
			expect(function () {
				var wrongTypeIdentifier = {};
				JSL.set({ id: wrongTypeIdentifier, from: "Irrelevant" });
			}).toThrow('The reference has wrong properties. Try to set an script \"id\" (string) and a "from". (Wrong reference: {"id":{},"from":"Irrelevant"}).');
		});

	});

	describe("when the module requires to fill a dependencies", function () {

		it("gets the dependencies oject filled when they are loaded", function () {
			window.some = "some value";
			window.compleja = { sub: "other value" };
			window.otra = { otro: { otronivel: "another one" } };

			JSL.set({
				id: "One.Module.In.NameSpace1",
				dependencies: { some: "some", compleja: { sub: "compleja.sub" }, otra: { otronivel: { subnivel: ["otra.otro.otronivel"] } } },
				from: function (dependencies) {

					expect(dependencies.some).toEqual(window.some);
					expect(dependencies.compleja).toEqual(window.compleja);
					expect(dependencies.otra.otronivel.subnivel).toEqual(window.otra.otro.otronivel);

				}
			});

			JSL.get({ id: "One.Module.In.NameSpace1" });

		});

		it("gets the dependencies object filled downloading dependencies from files", function (done) {
			var LIBRARY_PLUGIN_PATH = "./Fixtures/Library1.Plugin.js";
			var LIBRARY_PATH = "./Fixtures/Library1.js";
			JSL.set({ id: "Library1", from: LIBRARY_PATH });
			JSL.set({ id: "Library1.Plugin", from: LIBRARY_PLUGIN_PATH });
			var sampleModulePath = "./Fixtures/SampleModule.js";
			JSL.set({ id: "SampleModule", from: sampleModulePath });

			JSL.set({
				id: "One.Module.In.NameSpace",
				dependencies: { SampleModule: "SampleModule", another: { onelevel: { sublevel: ["Library1", "Library1.Plugin"] } } },
				from: function (dependencies) {

					expect(dependencies.another.onelevel.sublevel).toEqual(window.Library1);
					expect(dependencies.another.onelevel.sublevel.Plugin).toEqual(window.Library1.Plugin);

					done();
				}
			});

			JSL.get({ id: "One.Module.In.NameSpace" });

		});

	});

	describe("when the module requires third party libraries", function () {

		it("makes the library available through the dependencies", function (done) {
			JSL.set({ id: "$", from: JQUERY_PATH });
			JSL.set({
				id: "Module7",
				dependencies: { libraries: { $: "$" } }, // --> require a not downloaded library makes the test async
				from: function (dependencies) {
					expect(typeof (dependencies.libraries.$.ajax)).toEqual("function");
					done();
				}
			});

			JSL.get({ id: "Module7" });
		});

		it("doesn't download again the library if it has been loaded previously", function (done) {
			var numberOfjQuerys = document.querySelectorAll("script[src='" + JQUERY_PATH + "']").length;
			var script = document.createElement("script");
			script.src = JQUERY_PATH;
			script.addEventListener("load", function () {
				JSL.set({ id: "$", from: JQUERY_PATH });
				JSL.set({
					id: "ModuleThatUseADownloadedLibrary",
					dependencies: { libraries: { $: ["$"] } }, // --> jQuery required
					from: function (dependencies) {
						expect(typeof (dependencies.libraries.$.ajax)).toEqual("function");
					}
				});

				JSL.get({ id: "ModuleThatUseADownloadedLibrary" });

				expect(document.querySelectorAll("script[src='" + JQUERY_PATH + "']").length).toBe(numberOfjQuerys + 1);
				done();

			});
			document.body.appendChild(script);
		});

		it("downloads the script if can't access to the library global symbol", function (done) {
			var LIB_PATH = "./Fixtures/LibraryForNotAccesibleLibraryTest.js";
			expect(document.querySelectorAll("script[src='" + LIB_PATH + "']").length).toBe(0);
			JSL.set({ id: "lib", from: LIB_PATH });
			JSL.set({
				id: "ModuleThatUseANotAccesibleLibrary",
				dependencies: { libraries: { library: ["lib"] } }, // --> library required
				from: function (dependencies) {
					expect(dependencies.libraries.library.doSomething()).toEqual(true);
					expect(document.querySelectorAll("script[src='" + LIB_PATH + "']").length).toBe(1);
					done();
				}
			});
			JSL.get({ id: "ModuleThatUseANotAccesibleLibrary" });
		});

		it("fails when you try to register a library from without identifier", function () {
			expect(function () {
				var wrongTypeIdentifier = {};
				JSL.set({ library: wrongTypeIdentifier, from: "Irrelevant" });
			}).toThrow('The reference has wrong properties. Try to set an script \"id\" (string) and a "from". (Wrong reference: {"library":{},"from":"Irrelevant"}).');
		});

		it("may require a library with plugins available through the dependencies", function (done) {
			JSL.set({ id: "$", from: JQUERY_PATH });
			JSL.set({ id: "$.fn.sampleJQueryPlugin", from: "./Fixtures/sample.jquery.plugin.js" });
			JSL.set({
				id: "ModuleWithLibAndPlugin",
				dependencies: { libraries: { $: ["$", "$.fn.sampleJQueryPlugin"] } },
				from: function (dependencies) {
					expect(typeof (dependencies.libraries.$.fn.sampleJQueryPlugin)).toEqual("function");
					done();
				}
			});
			JSL.get({ id: "ModuleWithLibAndPlugin" });
		});

		it("may download a library with dependencies", function (done) {
			JSL.set({ id: "$", dependencies: "$.fn.sampleJQueryPlugin", from: JQUERY_PATH });
			JSL.get({ id: "$" }).then(function ($) {

				expect($.fn.sampleJQueryPlugin).not.toBe(undefined);
				done();

			});
		});

		it("doesn't download again the plugins if it has been loaded previously", function (done) {
			var LIBRARY_PLUGIN_PATH = "./Fixtures/Library1.Plugin.js";
			var LIBRARY_PATH = "./Fixtures/Library1.js";
			var numberOfPluginsInDOM = document.querySelectorAll("script[src='" + LIBRARY_PLUGIN_PATH + "']").length;
			JSL.set({ id: "Library1", from: LIBRARY_PATH });
			JSL.set({ id: "Library1.Plugin", from: LIBRARY_PLUGIN_PATH });

			var jqueryScript = document.createElement("script");
			jqueryScript.src = LIBRARY_PATH;
			jqueryScript.addEventListener("load", function () {
				var pluginScript = document.createElement("script");
				pluginScript.src = LIBRARY_PLUGIN_PATH;
				pluginScript.addEventListener("load", function () {
					JSL.set({
						id: "ModuleThatUseALibraryAndADownloadedPlugin",
						dependencies: { libraries: { Library1: ["Library1", "Library1.Plugin"] } }, // --> Library1 and a Library1 PLUGIN
						from: function (dependencies) {

							expect(document.querySelectorAll("script[src='" + LIBRARY_PLUGIN_PATH + "']").length).toBe(numberOfPluginsInDOM + 1);

							done();
						}
					});
					JSL.get({ id: "ModuleThatUseALibraryAndADownloadedPlugin" });
				});
				document.body.appendChild(pluginScript);
			});

			document.body.appendChild(jqueryScript);
		});

	});

	describe("when getting modules", function () {

		it("downloads the module scripts only once, regardless of how many times is the module started", function (done) {
			var sampleModulePath = "./Fixtures/SampleModule.js",
                firstStartCallbackExecuted = false;
			JSL.set({ id: "SampleModule", from: sampleModulePath });

			JSL.get({ id: "SampleModule" }).then(function () {
				firstStartCallbackExecuted = true;
			});
			JSL.get({ id: "SampleModule" }).then(function () {
				var howManyScriptsAreInTheDocument = document.querySelectorAll("script[src='" + sampleModulePath + "']").length;
				expect(firstStartCallbackExecuted).toBeTruthy();
				expect(howManyScriptsAreInTheDocument).toBe(1);
				done();
			});
		});

		it("fails if the module or its from hasn't been registered", function () {
			expect(function () {
				JSL.get({ id: "ModuleNotRegistered" });
			}).toThrow("The \"ModuleNotRegistered\" from hasn't been added.");
		});

		it("executes get promise", function () {
			var called = false;
			JSL.set({
				id: "OneModule",
				from: function () {
					function OneModule() {
						this.ImOnModule = "Yes";
					}
					return OneModule;
				}
			});

			JSL.get({ id: "OneModule" }).then(function (OneModule) {
				var instance = new OneModule();
				expect(instance.ImOnModule).toBe("Yes");
				called = true;
			});

			expect(called).toBeTruthy();
		});

		it("makes the dependencies avaiable trough dependencies object", function (done) {
			JSL.set({ id: "$", from: JQUERY_PATH });
			JSL.set({ id: "$.fn.sampleJQueryPlugin", from: "./Fixtures/sample.jquery.plugin.js" });
			JSL.set({
				id: "ModuleRequired",
				from: function () {
					function ModuleRequired() {
						this.ImModuleRequired = function () {
							return true;
						};
					}
					return ModuleRequired;
				}
			});
			JSL.set({
				id: "ModuleThatRequiresLibsAndModules",
				dependencies: {
					libraries: { $: ["$", "$.fn.sampleJQueryPlugin"] },
					collaborators: { ModuleRequired: "ModuleRequired" },
				},
				from: function (dependencies) {
					expect(typeof (dependencies.libraries.$)).toBe("function");
					expect(typeof (dependencies.libraries.$.fn.sampleJQueryPlugin)).toBe("function");
					var collaborator = new dependencies.collaborators.ModuleRequired();
					expect(collaborator.ImModuleRequired() === true).toBeTruthy();
					done();
				}
			});

			JSL.get({ id: "ModuleThatRequiresLibsAndModules" });

		});

	});

	describe("the dependency injection system", function () {
		beforeEach(function () {
			JSL.set({
				id: "Module1",
				from: function () {
					var self = this;
					self.doSomething1 = function (data) {
						return 1;
					};
					return self;
				}
			});
			JSL.set({
				id: "Module2",
				from: function () {
					var self = this;
					self.doSomething2 = function (data) {
						return 2;
					};
					return self;
				}
			});
			JSL.set({
				id: "Module3",
				collaborators: { dep1: "Module1", dep2: "Module2" },
				from: function (dependencies) {
					var self = this;
					self.doSomething3 = function () {
						return dependencies.collaborators.dep2.doSomething2() +
                                dependencies.collaborators.dep1.doSomething1();
					};
					return self;
				}
			});
		});

		xit("fails when the injected dependency is not expected by the module with a descriptive error", function () {
			JSL.set({
				id: "ModuleWithoutDependencies",
				from: function () { }
			});
			var notExpectedDependencyDefinition = { someIrrelevantMethod: function () { } };
			expect(function () {
				JSL.get({
					id: "ModuleWithoutDependencies",
					collaborators: { notExpecTedDependency: notExpectedDependencyDefinition }
				});
			}).toThrow("The injected dependency notExpecTedDependency is not expected by this module");
		});

		xit("can inject several collaborators to a module", function () {
			JSL.get({ id: "Module3" }).then(function (Module3) {
				var modulo3 = Module3.new();
				expect(modulo3.doSomething3()).toEqual(3);
			});
			JSL.stop({ id: "Module1" });
			JSL.stop({ id: "Module2" });
			JSL.stop({ id: "Module3" });
		});

		xit("can inject collaborators to a module on the fly when you get it", function () {
			var MOCKED_FUNCTION_RETURNED_DATA = "MOCKED_FUNCTION_RETURNED_DATA",
                SAMPLE_MODULE_ID = "IrrelevantModuleId",
                mockedDep1 = {
                	mockedDep1Method: function () {
                		return MOCKED_FUNCTION_RETURNED_DATA;
                	}
                };
			JSL.set({
				id: SAMPLE_MODULE_ID,
				collaborators: { dep1: "Module1" },
				from: function (dependencies) {
					var self = this;
					self.doSomething = dependencies.collaborators.dep1.mockedDep1Method;
				}
			});
			JSL.get({ id: SAMPLE_MODULE_ID, collaborators: { dep1: mockedDep1 } }).then(function (instance) {
				expect(instance.doSomething()).toBe(MOCKED_FUNCTION_RETURNED_DATA);
			});
			JSL.stop({ id: SAMPLE_MODULE_ID });
		});
	});

	describe("when customizing", function () {

		afterEach(function () {
			JSL.config({
				pathResolver: function (config) {
					return config.from;
				}
			});
		});

		it("fails if the configured pathResolver is not a  function", function () {
			expect(function () {
				var nonFunctionTypePathResolver = {}; // --> not a function
				JSL.config({
					pathResolver: nonFunctionTypePathResolver
				});
			}).toThrow("The configured pathResolver is not a function");
		});

		it("fails if pathResolver doesn't return a string", function () {
			JSL.config({
				pathResolver: function () {
					return {}; //--> returns an Object
				}
			});
			JSL.set({ id: "ModuleForWrongPathResolverTest", from: "IRRELEVANT_PATH" });
			expect(function () {
				JSL.get({ id: "ModuleForWrongPathResolverTest" });
			}).toThrow('The resolved url for "ModuleForWrongPathResolverTest"is not a string.');
		});

		it("may configure the function that must resolve the module references", function (done) {
			var pathResolverExecuted = false;

			JSL.config({
				pathResolver: function (config) {
					pathResolverExecuted = true;
					expect(typeof (config.id)).toBe("string");
					return config.from.whiteImplementation;
				}
			});

			JSL.set({
				id: "ModuleWithMultipleImplementations",
				from: {
					whiteImplementation: "./Fixtures/WhiteImplementation.js"
				}
			});

			JSL.get({ id: "ModuleWithMultipleImplementations" }).then(function (ModuleWithMultipleImplementations) {
				var whiteInstance = new ModuleWithMultipleImplementations();
				expect(whiteInstance.IamWhiteImplementation === true).toBeTruthy();
				expect(pathResolverExecuted).toBeTruthy();
				done();
			});
		});

	});

});