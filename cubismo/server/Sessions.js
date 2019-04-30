/* globals __ROOT Tools */
var Sessions = module.exports = {};

Sessions.Add = function(AppID) {
  Object.defineProperty(Sessions, AppID, {value: {}, enumerable: true});
  Sessions[AppID].Forms   = {};
  Sessions[AppID].Clients = {};
}