var express = require('express'),
    app = express();

app.use(express.static('./tests/'));
app.use(express.static('.'));
app.get('/', function (req, res) {
    res.sendfile('../AMD.SpecRunner.html');
});

var server = app.listen(process.env.PORT || 5000, function () {
    console.log('Express server listening');
});

module.export = server;