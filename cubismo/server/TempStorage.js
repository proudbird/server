/* globals Tools */
"use strict";

const _storage = {};

class TempStorage {

    setValue(value) {
        const id = Tools.GUID();
        _storage[id] = value;
        return id;
    }
    
    getValue(id, remove) {
        const value = _storage[id];
        if(remove != false) {
            delete _storage[id];
        }
        return value;
    }
    
    putValue(value) {
        return this.setValue(value);
    }
}

global.TempStorage = new TempStorage();