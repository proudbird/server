/* globals Tools Log*/
const Base = require('./Base.js');

function Enumeration(application, cube, name, dirname, filename) {
    
    const _ =  {};
    
    Base.call(this, application, cube, name, dirname, filename);
}
module.exports = Enumeration;