
/* global Tools */
"use strict";
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const Require = require("../Require.js");

const Item = require('./Item.js');

const View = require("../UI/View.js");

function CollectionType(_arguments) {

    //@TODO move it
            (function (original) {
                _arguments.model.build = function (values, options) {
                    if (Array.isArray(values)) {
                        return this.bulkBuild(values, options);
                    }
                    
                    if(Tools.has(values, "_")) {
                        //const instance = new this(values._.instance, options);
                        return values;//._.instance;
                    } else {
                        _arguments.instance = new this(values, options);
                        const item = new Item(_arguments);
                        return item;
                    }
                    
                };
            }(_arguments.model.build));

    this._ = {};
    this._.model = _arguments.model;
    this._.application = _arguments.application;

    const self = this;

    Object.defineProperty(this, "name", {
        value: this._.model.modelName,
        enumerable: false,
        writable: false
    });

    const associations = this._.model.associations;
    Tools.forIn(associations, association => {
        if(association.associationType === "HasMany") {
            Object.defineProperty(self, association.as, {
                value: association.target,
                enumerable: false,
                writable: false
            });
        }
    });

    this.__proto__.new = function (predefinedValues) {
        return _new(this, this._.model, predefinedValues);
    }


    this.__proto__.show = async function (_arguments) {
        const self = this;
        if (!_arguments) {
            _arguments = {};
        }
        _arguments.type = self;
        function mainFunction(callback) {
            _show(self, self._.model, _arguments)
            .then(view => {
                callback(null, new Promise(function (resolve, reject) {
                    view.closeCallback.on("close", function (value) {
                        resolve(value);
                    })
                }))
            })
        }

        return new Promise(function (resolve, reject) {
            mainFunction(function (error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    this.__proto__.select = async function (options, callback) {

        return await _select(this, this._.model, options);
    }

    this.__proto__.owner = function (options, callback) {
        const ownerAssosiation = this._.model.associations["Owner"];
        if(ownerAssosiation) {
            return Tools.getPropertyByTrack(this._.application, ownerAssosiation.target.name);
        }
        return undefined;
    }
}

function _new(self, model, predefinedValues) {

    let newInstance;
    if (predefinedValues && predefinedValues._ && predefinedValues._.instance) {
        predefinedValues = predefinedValues._.instance.toJSON();
        delete predefinedValues.id;
    }
    if (predefinedValues && predefinedValues.isNewRecord !== false) {
        newInstance = model.build(predefinedValues, { mainModel: model.name });
    } else {
        newInstance = model.build(predefinedValues, { mainModel: model.name });
    }

    if (model.associations instanceof Object) {
        var associations = model.associations;
        for (let key in associations) {
            if (associations[key].associationType === "HasMany") {
                newInstance[associations[key].as] = [];
            }
        }
    }

    if (predefinedValues) {
        for (let key in predefinedValues) {
            if (!newInstance[key] && model.associations[key]) {
                newInstance[key] = predefinedValues[key];
            }
        }
    }
    return newInstance;
}

function _show(self, model, _arguments) {

    if (!_arguments) {
        _arguments = {};
    }
    if (!_.isPlainObject(_arguments)) {
        throw new Error("Arguments must be an object!");
    }

    if (!_arguments.options) {
        _arguments.options = {};
    }
    if (_arguments.options && !_.isPlainObject(_arguments.options)) {
        throw new Error("Parametr 'options' must be an object!");
    } else {
        //_arguments.options = {};
    }

    if (_arguments.params && !_.isPlainObject(_arguments.params)) {
        throw new Error("Parametr 'params' must be an object!");
    } else {
        _arguments.params = {};
    }

    if (!_arguments.name) {
        _arguments.name = 'List';
    } else {
        _arguments.name = name;
    }

    _arguments.application = self._.application;
    _arguments.cube = model.cube;
    _arguments.class = model.class;
    _arguments.model = model;
    _arguments.modelName = model.modelName;

    const view = new View(_arguments);
    function mainFunction(callback) {
        view.show()
            .then(viewConfig => {
                //self._.application.window.ViewContainer.addView(viewConfig);
                callback(null, view);
            })
            .catch(err => {
                Log.error("Error on adding view", err);
            })
    }

    return new Promise(function (resolve, reject) {
        mainFunction(function (error, result) {
            error ? reject(error) : resolve(result);
        });
    });
};

function _select(self, model, options, callback) {

    function defineInclusions(model) {

        var _inclusions = new Array();

        function include(parentInc, target, alias, end) {
            const childInc = [];
            const inc = {
                model: target,
                as: alias
            };
            if (!end) {
                inc.include = childInc;
            }
            parentInc.push(inc);

            return childInc;
        }

        const definition = model.definition;

        if (model.associations) {
            for (let key in model.associations) {
                const association = model.associations[key];
                if (association.associationType === 'BelongsTo') {
                    if (association.as === "Parent") {
                        let parentInc = _inclusions;
                        let end = false;
                        for (let i = 0; i < definition.numberOfLevels; i++) {
                            if (i === definition.numberOfLevels - 1) {
                                end = true;
                            }
                            parentInc = include(parentInc, association.target, association.as, end);
                        }
                    } else {
                        _inclusions.push({
                            model: association.target,
                            as: association.as
                        });
                    }
                } else if (association.associationType === 'HasMany') {
                    let inclusion = {
                        model: association.target,
                        as: association.as,
                        separate: true
                    };
                    _inclusions.push(inclusion);
                    if (association.target.associations) {
                        var _subInclusions = new Array();
                        for (let nextKey in association.target.associations) {
                            const newAssociation = association.target.associations[nextKey];
                            if (newAssociation.associationType === 'BelongsTo') {
                                _subInclusions.push({
                                    model: newAssociation.target,
                                    as: newAssociation.as
                                });
                            }
                            inclusion.include = _subInclusions;
                        }
                    }
                }
            }
        }
        return _inclusions;
    }

    function mainFunction(options, callback) {
        var optionsCopy = _.clone(options);
        if (!optionsCopy) {
            optionsCopy = {};
        }
        var inclusions = defineInclusions(model);
        if (inclusions.length) {
            optionsCopy.include = inclusions;
        }
        optionsCopy.paranoid = false;
        optionsCopy.mainModel = model.name;
        model
            .findAll(optionsCopy)
            .then(result => {
                return callback(null, result);
            })
            .catch((error) => {
                return callback(error);
            });
    }

    if (callback) {
        return mainFunction(options, callback);
    }

    return new Promise(function (resolve, reject) {
        mainFunction(options, function (error, result) {
            error ? reject(error) : resolve(result);
        });
    });
};

module.exports = CollectionType;