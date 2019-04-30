/* globals Tools Log*/
const Collection = require('./Collection.js');
const View = require("../UI/View.js");

function Common(application, cube, name, dirname, filename) {
    
    this._ =  {};
    this._.application = application;
    this._.cube = cube;
    this._.dirname = dirname;
    
    Collection.call(this, application, cube, name, dirname, filename);
}

Common.prototype.Views = function(viewName, params) {

    _arguments = {};
    _arguments.options = {};
    _arguments.params = {};
    _arguments.name = viewName;

    if(params && params.item) {
        _arguments.item = params.item;
    }

    _arguments.application = this._.application;
    _arguments.cube = this._.cube;
    _arguments.class = "Common";

    return new View(_arguments);
}
module.exports = Common;