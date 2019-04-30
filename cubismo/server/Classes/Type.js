/* global Tools */
"use strict";
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const Require = require("../Require.js");

const Item = require('./Item.js');
const CollectionType = require('./CollectionType.js');

const Numerator = require('./Numerating.js');

const View = require("../UI/View.js");

function Type(_arguments) {

    this._ = {};
    this._.model = _arguments.model;
    this._.application = _arguments.application;

    const self = this;

    //@TODO move it
    (function (original) {
        _arguments.model.build = function (values, options) {
            if (Array.isArray(values)) {
                return this.bulkBuild(values, options);
            }
            
            if(Tools.has(values, "_")) {
                //const instance = new this(values._.instance, options);
                return values._.instance;
            } else {
                _arguments.instance = new this(values, options);
                const item = new Item(_arguments);
                return item;
            }
            
        };
    }(_arguments.model.build));

    Object.defineProperty(this, "name", {
        value: this._.model.modelName,
        enumerable: false,
        writable: false
    });

    const associations = this._.model.associations;
    Tools.forIn(associations, association => {
        if(association.associationType === "HasMany") {
            const _arg = {};
            _arg.model = association.target;
            _arg.application = self._.application;
            Object.defineProperty(self, association.as, {
                value: new CollectionType(_arg),
                enumerable: false,
                writable: false
            });
        }
    });  

    this.__proto__.new = function (predefinedValues) {
        return _new(this, this._.model, predefinedValues);
    }

    this.__proto__.newFolder = function (predefinedValues) {
        if (!predefinedValues) {
            predefinedValues = {}
            predefinedValues.isFolder = true;
        }
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

async function _new(self, model, predefinedValues) {

    const code = await Numerator.nextCode(self._.application, model);

    predefinedValues = predefinedValues || {};
    predefinedValues.Code = code;
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
                newInstance._.instance[associations[key].as] = [];
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
                //self._.application.window.ViewContainer.addView(viewConfig.config);
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

    let count = 1;

    function defineInclusions(model, curLevel, finish) {

        // if(count > 50) {
        //     //return;
        // }
        // count++;

        // console.log("model " + model.name);

        let level = curLevel || 1;
        // console.log("level " + curLevel);

        const inclusions = [];

        const definition = model.definition;

        if (model.associations) {
            for (let key in model.associations) {
                // console.log("association " + key);
                const association = model.associations[key];
                const inclusion = {
                    model: association.target,
                    as: association.as
                }
                if(association.associationType === 'HasMany') {
                    inclusion.order = ["order"];
                    inclusion.separate = true;
                }
                if (association.as === "Parent") {
                    if (level < definition.numberOfLevels) {
                        inclusion.include = defineInclusions(model, level + 1, false);         
                    } else {
                        level = 1;
                    }
                } else if (association.as === "Owner") {
                    //inclusion.include = defineInclusions(association.target, level, true);
                } else if (!finish) {
                    inclusion.include = defineInclusions(association.target, level, false);
                }
                inclusions.push(inclusion);
            }
        }
        return inclusions;
    }

    function _defineInclusions(model) {

        var _inclusions = new Array();

        function include(parentInc, target, alias, end) {
            const childInc = [];
            const inc = {
                model: target,
                as: alias
            };
            if (!end) {
                inc.include = childInc;
                //inc.include = defineInclusions(target);
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
                        // for (let i = 0; i < 6; i++) {   MAXIMUM 6 LEVELS!!!!!!
                            if (i === definition.numberOfLevels - 1) {
                                end = true;
                            }
                            parentInc = include(parentInc, association.target, association.as, end);
                       
                            
                        }
                    } else {
                        const inc = {
                            model: association.target,
                            as: association.as
                        };
                        
                        if(association.as != "Parent") {
                            inc.include = defineInclusions(association.target);
                        }
                        _inclusions.push(inc);
                    }
                } else if (association.associationType === 'HasMany') {
                    let inclusion = {
                        model: association.target,
                        as: association.as,
                        separate: true,
                        order: ["order"]
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
        const start = new Date();
        //Log.debug("start")
        var inclusions = defineInclusions(model);
        const finish = new Date();
        //Log.debug("finish")
        //Log.debug("time " + (finish-start))
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

module.exports = Type;