module.exports.run = function (root, port) {
    require("./server/Logger.js");
    require("./server/Errors.js");
    var platform = require("./server/Platform.js").init(root);
    var router = require("./server/Router.js").init(platform);
    var http = require("http");
    var server = http.createServer(router);
    server.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function () {
        var _a = server.address(), _address = _a._address, _port = _a._port;
        //Log.info(`cubismo server listening at ${_address}:${_port}`);
    });
};
//# sourceMappingURL=cubismo.js.map