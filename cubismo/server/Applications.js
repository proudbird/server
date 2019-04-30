/* globals debug __ROOT Tools Platform Sessions SEQUELIZE*/
'use strict';
var Applications = module.exports = {};

var fs = require('fs');
var path = require('path');

applications.Init = function(AppName, id) {
  var App = require("./application.js");
  var application = new App(AppName, id);
  Object.defineProperty(this, id, { value: application, enumerable: true });
  Object.defineProperty(application, 'Cubes', { value: {}, enumerable: true });
  applications.BindCubes(id);

  var ApplicationData = require('./ApplicationData.js');
  ApplicationData.Init(application.DBConnection, SEQUELIZE);

  applications.defineModelStructure(application);

}

applications.View = function(id) {
  var Window = applications.InitForm("Window", Applications[id]);
  //Applications[id].Window = Window;
  var View = Window.Show();
  return View;
}

applications.require = function(FileName, SubWraper, ClearCache) {
  if (FileName) {
    if (process.env.NODE_ENV === "development" || ClearCache) {
      delete require.cache[require.resolve(FileName)];
    }
    try {
      var Module = require("module");
      (function(OriginalModuleWrap) {
        Module.wrap = function(Script) {
          var Wrapper = [
            '(function (exports, require, module, __filename, __dirname) { ',
            '\n});'
          ];
          var Wrap = Wrapper[0] + SubWraper.join(' ') + Script + Wrapper[1];
          return Wrap;
        };
      }(Module.wrap));

      var _Module = require(FileName);

      (function(OriginalModuleWrap) {
        Module.wrap = function(Script) {
          var Wrapper = [
            '(function (exports, require, module, __filename, __dirname) { ',
            '\n});'
          ];
          var Wrap = Wrapper[0] + Script + Wrapper[1];
          return Wrap;
        };
      }(Module.wrap));

      return _Module;
    }
    catch (ex) {
      throw new Error("Exception in module '" + FileName + "' =>" + ex);
    }
  }
  else {
    throw new Error("Cannot find module '" + FileName + "'");
  }
}

applications.InitForm = function(FormName, application, cube, ModelType, ModelName) {
  var FileName = __ROOT + '/core/Form.js';

  const cube = cube ? 'Platform.Applications["' + application.ID + '"]["' + cube.Name + '"]' : 'undefined';
  const type = ModelType ? '"' + ModelType + '"' : 'undefined';
  const model = ModelName ? '"' + ModelName + '"' : 'undefined';

  var SubWraper = [
    '"use strict";',
    'var FormName = "' + FormName + '";',
    'var application = Platform.Applications["' + application.ID + '"];',
    'var Session = Sessions["' + application.ID + '"];',
    'var CurrentUser = application.Users["' + process.env.USER + '"];',
    'var cube = ' + cube + ';',
    'var ApplicationType = ' + type + ';',
    'var Model = ' + model + ';'
  ];

  return applications.require(FileName, SubWraper, true);
}

applications.LoadView = function(FormName, ID, ContainerID, id, cube, ApplicationType, ObjectType, Master) {
  var Path = [Applications[id].Dir];
  if (cube) {
    Path.push(cube.Name);
    if (!ApplicationType) {
      Path.push('Common/Forms');
      Path.push(FormName);
    }
  };
  if (ApplicationType) { Path.push(ApplicationType) };
  if (ObjectType) {
    Path.push(ObjectType)
    Path.push('Forms');
    Path.push(FormName);
  };
  Path.push(FormName + 'View.js');

  var FileName = Path.join('/');

  if (FormName === "ListForm" && !fs.existsSync(FileName)) {
    FileName = "./UI/defaultViews/collectionLookUpView.js";
  }

  var SubWraper = [
    'var application = Platform.Applications["' + id + '"];',
    'var Session = Sessions["' + id + '"];',
    'var ID = "' + ID + '";',
    'var ContainerID = "' + ContainerID + '";',
    'var webix = "{}";',
    'webix.Date = {dateToStr: function (arg) {}};'
  ];

  return applications.require(FileName, SubWraper, true);
}

applications.BindFormModule = function(FormName, ID, application, cube, ApplicationType, ObjectType) {
  var Path = [Applications[application.ID].Dir];
  if (cube) {
    Path.push(cube.Name);
    if (!ApplicationType) {
      Path.push('Common/Forms');
      Path.push(FormName);
    }
  };
  if (ApplicationType) { Path.push(ApplicationType) };
  if (ObjectType) {
    Path.push(ObjectType)
    Path.push('Forms');
    Path.push(FormName);
  };
  Path.push(FormName + '.js');

  var FileName = Path.join('/');

  if (FormName === "ListForm" && !fs.existsSync(FileName)) {
    FileName = "./UI/defaultViews/collectionLookUp.js";
  }

  const cube = cube ? 'Platform.Applications["' + application.ID + '"]["' + cube.Name + '"]' : 'undefined';

  var SubWraper = [
    '"use strict";',
    'var FormName = "' + FormName + '";',
    'var Form = Platform.Forms["' + ID + '"];',
    'var application = Platform.Applications["' + application.ID + '"];',
    'var Session = Sessions["' + application.ID + '"];',
    'var CurrentUser = application.Users["' + process.env.USER + '"];',
    'var cube = ' + cube + ';'
  ];

  return applications.require(FileName, SubWraper, true);
}

applications.BindUIElementModule = function(application, FormID, ElementName, ViewName) {
  var FileName = __ROOT + '/core/UI/' + ViewName + '.js';
  if (fs.existsSync(FileName)) {
    if (ElementName) {
      var SubWraper = [
        '"use strict";',
        'var application = Platform.Applications["' + application.ID + '"];',
        'var Form = Platform.Forms["' + FormID + '"];',
        'var UIElement = Platform.Forms["' + FormID + '"]["' + ElementName + '"];'
      ];
    }
    else {
      var SubWraper = [
        '"use strict";',
        'var Form = Platform.Forms["' + FormID + '"];',
        'var UIElement = Platform.Forms["' + FormID + '"];'
      ];
    }
    return applications.require(FileName, SubWraper, true);
  }
}

function bindCube (application, cubeName, cubeModuleFile) {
  
  application[cubeName] = {};
  application.Cubes[cubeName] = application[cubeName];
  
  const cubeDir = path.dirname(cubeModuleFile);
  application[cubeName].dir = cubeDir;
  application[cubeName].name = cubeName;'

  bindCubeCommonMethods(application, cubeName);

  var subWraper = [
    '"use strict";',
    'var Application = Platform.Applications["' + application.id + '"];',
    'var Cube = Platform.Applications["' + application.id + '"]["' + cubeName + '"];',
    'var Dir = "' + cubeDir + '";',
  ];

  return _require(cubeModuleFile, subWraper, true);
}

bindCubeMethods = function(application, cubeName) {
  
  var fileName = __ROOT + '/core/cube.js';
  var subWraper = [
    '"use strict";',
    'var Application = Platform.Applications["' + application.id + '"];',
    'var Cube = Platform.Applications["' + application.id + '"]["' + cubeName + '"];',
  ]
  
  return applications.require(FileName, SubWraper, true);
}

function bindCommonModule(application, cubeName, moduleName, commonModuleFile) {

  var subWraper = [
    '"use strict";',
    'var Application = Platform.Applications["' + application.id + '"];',
    'var Cube = Platform.Applications["' + application.id + '"]["' + cubeName + '"];',
    'var Module = Platform.Applications["' + application.id + '"]["' + cubeName + '"].Common.Modules["' + moduleName + '"];',
    'var Dir = "' + path.dirname(commonModuleFile) + '";'
  ];

  return _require(commonModuleFile, subWraper, true);
}

defineModelStructure = function(application) {

  const appDir = application.Dir;
  const registredClasses = ["Common", "Сonstants", "Catalogs", "Recorders", "Registers", "Enumerations"]
  
  const files = fs.readdirSync(appDir);
  for (let i = 0; i < files.length; i++) {
    let cubeFile = files[i];
    let cubeDir = path.join(appDir, cubeFile);
    if (fs.statSync(cubeDir).isDirectory()) {
      if (cubeName.match(/\.|\../) == null) {
        let cubeName = cubeFile;
        let cubeModuleFile = path.join(cubeFile, 'Module.js');
        if (fs.existsSync(cubeModuleFile)) {
          
          bindCube(application, cubeName, cubeModuleFile);
          
          registredClasses.forEach(className => {
            application[cube][className] = {};
          });
          application[cube].Common.Modules = {};

          let cubeFiles = fs.readdirSync(cubeDir);
          for (let i = 0; i < cubeFiles.length; i++) {
            
            let classFile = cubeFiles[i];
            let classDir = path.join(cubeDir, classFile);
            if(fs.statSync(classDir).isDirectory()) {
              let className = classFile;
              if(!registredClasses.includes(className)) {
                continue;
              };
              let modelName = undefined;
              let modelModuleFile = undefined;
              let modelDefinition = undefined;
                
              let classFiles = fs.readdirSync(classDir);
              for (let i = 0; i < cubeFiles.length; i++) {
                let splitedName = classFile.split(".");
                if(splitedName[0] === className && splitedName[2] === "js") {
                  modelName = splitedName[1];
                  modelModuleFile = path.join(classDir, classFile);
                }
                if(splitedName[0] === className && splitedName[2] === "Model" && splitedName[3] === "json") {
                  modelDefinition = require(path.join(classDir, classFile));
                }
                if(className === "Common" 
                  && splitedName[0] === className 
                  && splitedName[1] === "Modules" 
                  && splitedName[3] === "js") {
                    const commonModuleName = splitedName[2];
                    const commonModuleFile = path.join(classDir, classFile);
                    const commonModule = application[cube].Common.Modules[commonModuleName] = {};
                    bindCommonModule(application, cubeName, commonModuleName, commonModuleFile);
                }
              }
              
              if(modelDefinition) {
                let model = require('./modelGenerator.js').define(application, modelDefinition);
              }
              
              application[cube][className][modelName] = model;
              
              let commonModelMethods = require('./models/common.js');
              commonModelMethods.bindMetods(model);
              let classModelMethods = require('./models/' + className + '.js');
              classModelMethods.bindMetods(model);
  
              if(modelModuleFile) {
                bindModelMetods(application, model, modelModuleFile);
              }
            }
          }
        }
      }
    }
  }
}