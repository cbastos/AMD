var webdriver = require('selenium-webdriver');

describe("The JSL manager", function () {

	var browsers = ["chrome", "firefox"];

	for (var i = 0, l = browsers.length; i < l; ++i) {

		expect_integration_tests_works_in(browsers[i]);

	}

	function expect_integration_tests_works_in(browserName) {
		it("works in " + browserName, function (done) {
			var browser = new webdriver.Builder().forBrowser(browserName).build();
			browser.get('http://localhost:4505/JSL.SpecRunner.html');
			browser.wait(function () {
				return browser.isElementPresent(webdriver.By.className('duration'));
			}).then(function () {

				browser.findElements(webdriver.By.className('failed')).then(function (failed) {

					expect(failed.length).toBe(0);

					browser.close();
					setTimeout(function () { done(); }, 0); //setTimeout hack for avoid the error closing the browser.
				});
			});
		});
	}

});