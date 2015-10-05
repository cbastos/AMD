var webdriver = require('selenium-webdriver');

describe("The AMD AMD - browser integration tests", function () {

    it("loads in chrome", function (done) {

        var browser = new webdriver.Builder().usingServer().withCapabilities({ 'browserName': 'chrome' }).build();
        browser.get('http://localhost:4505/AMD.SpecRunner.html');
        browser.wait(function () {
            return browser.isElementPresent(webdriver.By.className('duration'));
        }).then(function () {

            browser.findElements(webdriver.By.className('failed')).then(function (failed) {
               
                expect(failed.length).toBe(0);
                done();

                browser.quit();

            });
        });

    });

});