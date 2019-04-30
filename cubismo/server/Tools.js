const fs = require('fs');
const util = require('util');
const sid = require('shortid');

const Tools = require('deepdash')(require('lodash'));

module.exports = Tools;

Tools.FindFile = function (FileName, Path, ExcludeNodeModule) {

  var fullPathToFile = Path + '/' + FileName;
  if (fs.existsSync(fullPathToFile)) {
    return fullPathToFile;
  }

  var files = fs.readdirSync(Path);
  for (var i = 0; i < files.length; i++) {
    var rootName = files[i];
    var isDir = fs.statSync(Path + '/' + rootName).isDirectory();
    if (isDir) {
      if (ExcludeNodeModule) {
        var reg = /node_modules/;
        if (rootName.match(reg) !== null) {
          continue;
        }
      }
      var reg = /\.|\../;
      if (rootName.match(reg) == null) {
        var fullPathToFile = Path + '/' + rootName + '/' + FileName;
        if (fs.existsSync(fullPathToFile)) {
          return fullPathToFile;
        } else {
          var newPath = Path + '/' + rootName;
          fullPathToFile = Tools.FindFile(FileName, newPath);
          if (fs.existsSync(fullPathToFile)) {
            return fullPathToFile;
          }
        }
      }
    }
  }
  return undefined;
}

function config(variable) {

  var configBody = fs.readFileSync(__ROOT + '/config.json').toString('UTF-8');
  var config = JSON.parse(configBody);

  return config[variable];
}
module.exports.config = config;

function classSourceCode() {
  return util.format.apply(null, arguments);
}
module.exports.classSourceCode = classSourceCode;

function findOneInArray(array, selector) {
  for (var i = 0; i < array.length; i++) {
    var wanted = undefined;
    for (var key in selector) {
      if (array[i][key] === selector[key]) {
        wanted = array[i];
      } else {
        wanted = undefined;
      }
    }
    if (__DEF(wanted)) {
      return wanted;
    }
  }
  return undefined;
}
module.exports.findOneInArray = findOneInArray;


Tools.SID = function () {
  return sid.generate();
}

Tools.GUID = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

Tools.ObjectToJSON = function (Object) {
  return JSON.stringify(Object, function (key, value) {
    if (typeof value === "function") {
      return "/Function(" + value.toString() + ")/";
    }
    if (typeof value === "date") {
      return;
    }
    return value;
  });
}

Tools.dataToJSON = function (data) {
  let result = [];
  for (let i in data) {
    result.push(data[i].toJSON());
  }

  return result;
}

Tools.getPropertyByTrack = function (instance, track, startPosition) {
  if (!track) {
    return undefined;
  }
  if (!startPosition) {
    startPosition = 1;
  }
  var properties = track.split('.');
  if (!Array.isArray(properties) || properties.length == 0) {
    return undefined;
  }
  var result = instance;
  for (i = startPosition - 1; i < properties.length; i++) {
    result = result[properties[i]];
  }
  return result;
}

Tools.setPropertyByTrack = function (instance, track, value, startPosition) {
  if (!track) {
    return undefined;
  }
  if (!startPosition) {
    startPosition = 1;
  }
  var properties = track.split('.');
  if (!Array.isArray(properties) || properties.length == 0) {
    return undefined;
  }
  var result = instance;
  for (i = startPosition - 1; i < properties.length; i++) {
    result = result[properties[i]];
  }
  result = value;
  return result;
}

Tools.log = function (message, error) {
  console.log("=== " + message);
  console.timeStamp();
  if (error) {
    console.dir(error);
  }

  // Dialog.message({
  //   text: message,
  //   type: "error",
  //   expire: -1
  // });
  //console.log("\n");
}

Tools.Callback = function (callback) {
  if (typeof callback === 'function') {
    let a = arguments;
    return callback(a[1], a[2], a[3], a[4], a[5]);
  }
}

Tools.ConvertByteSize = function (size, dimension) {
  dimension = dimension || 1;
  const rate = Math.pow(1024, dimension);
  size = size / rate;
  while (size > rate) {
    size = size / rate;
  }
  return Math.round(size * 100) / 100;
}

Tools.Window = function () {
  return Platform.Forms[process.env.WINDOW];
}

Tools.Dialog = {};

Tools.Dialog.alert = function (config) {
  Window().Client.emit('dialog', {
    type: 'alert',
    config: config
  });
}

Tools.Dialog.message = function (config) {
  Window().Client.emit('dialog', {
    type: 'message',
    config: config
  });
}

Tools.Dialog.waitingCursor = function (state) {
  Window().Client.emit('dialog', {
    type: 'waitingCursor',
    config: state
  });
}

Tools.Dialog.notify = function (title, options, callback) {

  if (options && options.icon) {
    options.icon = "/files/img/" + options.icon;
  }

  if (options && options.sound) {
    options.sound = "/files/audio/" + options.sound;
  }

  Window().Client.emit('dialog', {
    type: 'notify',
    title: title,
    options: options
  }, function (error) {
    Callback(callback);
  });
}



function formatDate(date, format, utc) {
  var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function ii(i, len) {
    var s = i + "";
    len = len || 2;
    while (s.length < len) s = "0" + s;
    return s;
  }

  var y = utc ? date.getUTCFullYear() : date.getFullYear();
  format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
  format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
  format = format.replace(/(^|[^\\])y/g, "$1" + y);

  var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
  format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
  format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
  format = format.replace(/(^|[^\\])M/g, "$1" + M);

  var d = utc ? date.getUTCDate() : date.getDate();
  format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
  format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
  format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
  format = format.replace(/(^|[^\\])d/g, "$1" + d);

  var H = utc ? date.getUTCHours() : date.getHours();
  format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
  format = format.replace(/(^|[^\\])H/g, "$1" + H);

  var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
  format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
  format = format.replace(/(^|[^\\])h/g, "$1" + h);

  var m = utc ? date.getUTCMinutes() : date.getMinutes();
  format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
  format = format.replace(/(^|[^\\])m/g, "$1" + m);

  var s = utc ? date.getUTCSeconds() : date.getSeconds();
  format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
  format = format.replace(/(^|[^\\])s/g, "$1" + s);

  var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
  format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])f/g, "$1" + f);

  var T = H < 12 ? "AM" : "PM";
  format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
  format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

  var t = T.toLowerCase();
  format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
  format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

  var tz = -date.getTimezoneOffset();
  var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
  if (!utc) {
    tz = Math.abs(tz);
    var tzHrs = Math.floor(tz / 60);
    var tzMin = tz % 60;
    K += ii(tzHrs) + ":" + ii(tzMin);
  }
  format = format.replace(/(^|[^\\])K/g, "$1" + K);

  var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
  format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
  format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

  format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
  format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

  format = format.replace(/\\(.)/g, "$1");

  return format;
};

Tools.makeHierarchical = function(arr, parent, child, map) {
  var tree = [],
    mappedArr = {},
    arrElem,
    mappedElem;

  // First map the nodes of the array to an object -> create a hash table.
  for (var i = 0, len = arr.length; i < len; i++) {
    arrElem = arr[i];
    mappedArr[arrElem.id] = arrElem;
    mappedArr[arrElem.id][child] = [];
  }

  for (var id in mappedArr) {
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      if(map) {
        const data = {};
        for(let key in mappedElem) {
          if(map[key]) {
            const newKey = map[key];
            data[newKey] = mappedElem[key];
          } else {
            data[key] = mappedElem[key];
          }
        }
        mappedElem = data;
      }
      // If the element is not at the root level, add it to its parent array of children.
      if (mappedElem[parent]) {
        mappedArr[mappedElem[parent]][child].push(mappedElem);
      }
      // If the element is at the root level, add it to first level elements array.
      else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
}

function getNestedChildren(arr, parent) {
  var out = []
  for(var i in arr) {
      if(arr[i].parent == parent) {
          var children = getNestedChildren(arr, arr[i].id)

          if(children.length) {
              arr[i].children = children
          }
          out.push(arr[i])
      }
  }
  return out
}

Tools.traverse = function (original, fn) {
  const copy = Tools.cloneDeep(original);
  fn(original);
  Tools.eachDeep(copy, (value, key, parent, context) => {
    const node = Tools.get(original, context.path);
    fn(node);
  });
}