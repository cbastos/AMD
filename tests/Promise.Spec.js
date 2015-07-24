describe("The promises", function () {
    var promise,
        executed;

    beforeEach(function () {
        promise = new AMD.classes.Promise();
        executed = false;
    });

    it("works", function () {
        promise.then(function () { executed = true; });

        expect(executed).toBeFalsy();
        promise.done();
        expect(executed).toBeTruthy();
    });

    it("works when resolves before", function () {
        promise.done();
        expect(executed).toBeFalsy();

        promise.then(function () { executed = true; });

        expect(executed).toBeTruthy();
    });

    it("works with arguments", function () {
        promise.then(function (arg1) {
            expect(arg1).toEqual(777);
        });

        promise.done(777);
    });

});