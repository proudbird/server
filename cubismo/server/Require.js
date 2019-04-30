"use strict";
const fs = require("fs");
const Module = require("module");

module.exports = function (pathToModule, _arguments, clearCache) {

    if (fs.existsSync(pathToModule)) {
        if (clearCache) {
            if (require.cache[require.resolve(pathToModule)]) {
                delete require.cache[require.resolve(pathToModule)];
            } else {
                //console.log("no cache");
            }
        }

        const _argNames = [];
        const _argValues = [];

        if (_arguments && typeof _arguments != "object") {
            throw new Error("Error on loading module '" + pathToModule + "'. Second argument can be only an object.");
        } else {
            for (let key in _arguments) {
                _argNames.push(key);
                _argValues.push(_arguments[key]);
            }
        }
        try {
            if (_arguments) {
                // override original Node 'require' function to supply our module with additional 
                // global variables
                (function (originalModuleWrap) {
                    Module.wrap = function (script) {
                        const wrapper = [
                            '(function (exports, require, module, __filename, __dirname) { ',
                            'module.exports.init = function(' + _argNames.join(", ") + ') { ',
                            '\n}});'
                        ];
                        return wrapper[0] + wrapper[1] + script + wrapper[2];
                    };
                }(Module.wrap));

                // loading our module
                var _module = require(pathToModule);

                // returning 'require' function to the original state
                (function (originalModuleWrap) {
                    Module.wrap = function (script) {
                        const wrapper = [
                            '(function (exports, require, module, __filename, __dirname) { ',
                            '\n});'
                        ];
                        return wrapper[0] + script + wrapper[1];
                    };
                }(Module.wrap));

                if (_module.init) {
                    _module.init(_argValues[0], _argValues[1], _argValues[2], _argValues[3], _argValues[4],
                        _argValues[5], _argValues[6], _argValues[7], _argValues[8], _argValues[9]);
                } 
                return _module;
            } else {
                return require(pathToModule);
            }
        } catch (err) {
            throw err;
        }
    } else {
        throw new Error("Cannot find module '" + pathToModule + "'");
    }
}