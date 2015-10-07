describe("The promises", function () {
    var promise,
        executed;

    beforeEach(function () {
        promise = new JSL.classes.Promise();
        executed = false;
    });

    it("works", function () {
        promise.then(function () { executed = true; });

        expect(executed).toBeFalsy();
        promise.resolve();
        expect(executed).toBeTruthy();
    });

    it("works when resolves before", function () {
    	promise.resolve();
        expect(executed).toBeFalsy();

        promise.then(function () { executed = true; });

        expect(executed).toBeTruthy();
    });

    it("works with arguments", function () {
        promise.then(function (arg1) {
            expect(arg1).toEqual(777);
        });

        promise.resolve(777);
    });

});