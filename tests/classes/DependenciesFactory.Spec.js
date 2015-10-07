describe("The dependencies factory", function () {
    var dependenciesFactory;

    beforeEach(function () {
        dependenciesFactory = new JSL.classes.DependenciesFactory();
    });

    it("can create a dependencies object trought a dependencies template with simple (string) dependencies", function () {
        var some_dependency = "some_dependency",
            some_dependency_value = {some : "thing"};
        window[some_dependency] = some_dependency_value;

        var dependencies = dependenciesFactory.createFrom({ template: some_dependency });

        expect(dependencies.template).toBe(some_dependency_value);

    });

    it("can create a dependencies object trought a dependencies template with complex (string array) dependencies, retrieving the first", function () {
        var some_dependency = "some_dependency",
            some_dependency_value = { some: "thing" },
            another_dependency = "another_dependency",
            another_dependency_value = { another: "thing" };

        window[some_dependency] = some_dependency_value;
        window[another_dependency] = another_dependency_value;

        var dependencies = dependenciesFactory.createFrom({ template: [some_dependency, another_dependency]});

        expect(dependencies.template).toBe(some_dependency_value);

    });

    it("can create a dependencies object with default dependencies", function () {
        var default_dependencies = { some_thing: "value" },
            dependencies = dependenciesFactory.createFrom({}, default_dependencies);

        expect(dependencies.some_thing).toBe(default_dependencies.some_thing);

    });

});