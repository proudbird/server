/* globals debug __ROOT Tools Platform Sessions SEQUELIZE*/ 
'use strict'; 
var Applications = module.exports = {};

var fs   = require('fs');

Applications.Init = function(AppName, AppID) {
  var App = require("./Application.js");
  var Application = new App(AppName, AppID);
  Object.defineProperty(this, AppID, {value: Application, enumerable: true});
  Object.defineProperty(Application, 'Cubes', {value: {}, enumerable: true});
  Applications.BindCubes(AppID);
  
  var ApplicationData = require('./ApplicationData.js');
  ApplicationData.Init(Application.DBConnection, SEQUELIZE);
  
  Applications.BuildModelStructure(AppID);
  
  // Application.DBConnection.models.recMessage.drop();
  // Application.DBConnection.models.recMessageAttachments.drop();
  // Application.DBConnection.models.catMailFolders.drop();
  
  // Application.DBConnection.models.catMailFolders.drop();
  // Application.DBConnection.models.catMailMailFolders.drop();
  // Application.DBConnection.models.catMailUsers.drop();
  // Application.DBConnection.models.colMailAttachments.drop();
  // Application.DBConnection.models.recMailMessages.drop();
  // Application.DBConnection.models.catMailMailFolders.drop();
  
  // for(let key in Application.DBConnection.models) {
  //   Application.DBConnection.models[key].drop();
  // }
  
  // Application.DBConnection.models.catMail_Users.drop();
  
  // Application.DBConnection.sync().then(()=> {
  //   Application.DBConnection.getQueryInterface().describeTable("catGoods_Products").then((schema) => {
  //     console.log(schema);
  //   });
  // });
  
  


  Application.Users = {};
  var Users = Application.DBConnection.models.sysUsers;
  Users
    .findAll()
    .then((list) => {
      for(let i=0; i<list.length; i++) {
        Application.Users[list[i].Login] = list[i];   
      };
    })
  
  // for(let key in Application.DBConnection.models) {
  //   Application.DBConnection.models[key].truncate();
  // }
  
  // // Application.DBConnection.models.sysUsers.truncate();
  // Application.DBConnection.models.sysUsers.create({ Login: 'admin', Password: 'admin' })
  //  Application.DBConnection.models.sysUsers.create({ Login: 'Artem', Password: '123' })
  
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 6, Name: 'All messages', IMAPName: 'ALL'});
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 1, Name: 'Indox', IMAPName: 'INBOX'});
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 2, Name: 'Sent', IMAPName: 'SENT'});
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 3, Name: 'Drafts', IMAPName: 'DRAFT'});
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 4, Name: 'Spam', IMAPName: 'SPAM'});
  // Application.DBConnection.models.catMail_MailFolders.create({ Code: 5, Name: 'Trash', IMAPName: 'TRASH'});
  
}

Applications.View = function(AppID) {
  var Window = Applications.InitForm("Window", Applications[AppID]);
  //Applications[AppID].Window = Window;
  var View = Window.Show();
  return View;
}

Applications.Require = function(FileName, SubWraper, ClearCache) {
  if (FileName) {
    if(process.env.NODE_ENV === "development" || ClearCache) {
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
    } catch (ex) {
      throw new Error("Exception in module '" + FileName + "' =>"  + ex);
    }
  }
  else {
    throw new Error("Cannot find module '" + FileName + "'");
}}

Applications.InitForm = function(FormName, Application, Cube, ModelType, ModelName) {
  var FileName = __ROOT + '/server/Form.js';
  
  const cube  = Cube ? 'Platform.Applications["' + Application.ID + '"]["' + Cube.Name + '"]' : 'undefined';
  const type  = ModelType ? '"' + ModelType + '"' : 'undefined';
  const model = ModelName ? '"' + ModelName + '"' : 'undefined';
  
  var SubWraper = [
    '"use strict";',
    'var FormName = "' + FormName + '";',
    'var Application = Platform.Applications["' + Application.ID + '"];',
    'var Session = Sessions["' + Application.ID + '"];',
    'var CurrentUser = Application.Users["' + process.env.USER + '"];',
    'var Cube = ' + cube + ';',
    'var ApplicationType = ' + type + ';',
    'var Model = ' + model + ';'
  ];

  return Applications.Require(FileName, SubWraper, true);
}

Applications.LoadView = function(FormName, ID, ContainerID, AppID, Cube, ApplicationType, ObjectType, Master) {
  var Path = [Applications[AppID].Dir];
  if(Cube) { 
    Path.push(Cube.Name);
    if(!ApplicationType) { 
      Path.push('Common/Forms');
      Path.push(FormName);
    }
  };
  if(ApplicationType) { Path.push(ApplicationType) };
  if(ObjectType) {
    Path.push(ObjectType)
    Path.push('Forms');
    Path.push(FormName);
  };
  Path.push(FormName + 'View.js');

  var FileName = Path.join('/');

  if(FormName === "ListForm" && !fs.existsSync(FileName)) {
    FileName = "./UI/defaultViews/collectionLookUpView.js";
  }

  var SubWraper = [
    'var Application = Platform.Applications["' + AppID + '"];',
    'var Session = Sessions["' + AppID + '"];',
    'var ID = "' + ID + '";',
    'var ContainerID = "' + ContainerID + '";',
    'var webix = "{}";',
    'webix.Date = {dateToStr: function (arg) {}};'
  ];
          
  return Applications.Require(FileName, SubWraper, true);
}

Applications.BindFormModule = function(FormName, ID, Application, Cube, ApplicationType, ObjectType) {
  var Path = [Applications[Application.ID].Dir];
  if(Cube) { 
    Path.push(Cube.Name);
    if(!ApplicationType) { 
      Path.push('Common/Forms');
      Path.push(FormName);
    }
  };
  if(ApplicationType) { Path.push(ApplicationType) };
  if(ObjectType) {
    Path.push(ObjectType)
    Path.push('Forms');
    Path.push(FormName);
  };
  Path.push(FormName + '.js');

  var FileName = Path.join('/');

  if(FormName === "ListForm" && !fs.existsSync(FileName)) {
    FileName = "./UI/defaultViews/collectionLookUp.js";
  }
  
  const cube  = Cube ? 'Platform.Applications["' + Application.ID + '"]["' + Cube.Name + '"]' : 'undefined';
  
  var SubWraper = [
    '"use strict";',
    'var FormName = "' + FormName + '";',
    'var Form = Platform.Forms["' + ID + '"];',
    'var Application = Platform.Applications["' + Application.ID + '"];',
    'var Session = Sessions["' + Application.ID + '"];',
    'var CurrentUser = Application.Users["' + process.env.USER + '"];',
    'var Cube = ' + cube + ';'
  ];
  
  return Applications.Require(FileName, SubWraper, true);
}

Applications.BindUIElementModule = function(Application, FormID, ElementName, ViewName) {
  var FileName = __ROOT + '/server/UI/' + ViewName + '.js';
  if (fs.existsSync(FileName)) {
    if(ElementName) {
      var SubWraper = [
        '"use strict";',
        'var Application = Platform.Applications["' + Application.ID + '"];',
        'var Form = Platform.Forms["' + FormID + '"];',
        'var UIElement = Platform.Forms["' + FormID + '"]["' + ElementName + '"];'
      ];
    } else {
        var SubWraper = [
        '"use strict";',
        'var Form = Platform.Forms["' + FormID + '"];',
        'var UIElement = Platform.Forms["' + FormID + '"];'
      ];
    }
    return Applications.Require(FileName, SubWraper, true);
}}

Applications.BindCubes = function(AppID) {
  var Path = Applications[AppID].Dir;
  var Files = fs.readdirSync(Path);
  for (let i=0; i<Files.length; i++) {
    var RootName = Files[i];
    var isDir = fs.statSync(Path + '/' + RootName).isDirectory();
    if(isDir) {
      var reg = /\.|\../;
      if (RootName.match(reg) == null) { 
        var FileName = Path + '/' + RootName + '/' + RootName + '.js';
        if (fs.existsSync(FileName)) {
          Object.defineProperty(Applications[AppID], RootName, {value: {}, enumerable: true});
          Object.defineProperty(Applications[AppID].Cubes, RootName, {value: Applications[AppID][RootName], enumerable: true});
          Applications.BindCubeMethods(AppID, RootName);
          var SubWraper = [
            '"use strict";',
            'var Application = Platform.Applications["' + AppID + '"];',
            'var Cube = Platform.Applications["' + AppID + '"]["' + RootName + '"];',
            'var Dir = "' + Path + '/' + RootName + '";',
            'Cube.Dir = Dir;'
          ];
          Applications.Require(FileName, SubWraper, true);
          Object.defineProperty(Applications[AppID][RootName], 'CommonModule', {value: {}, enumerable: true});
          var NextPath = Path + '/' + RootName + '/Common/Modules';
          if (fs.existsSync(NextPath)) {
            var NextFiles = fs.readdirSync(NextPath);
            for (let i=0; i<NextFiles.length; i++) {
              var FileName = NextFiles[i];
              if(!fs.statSync(NextPath + '/' + FileName).isDirectory()) {
                const Module = FileName.slice(0, -3);
                Object.defineProperty(Applications[AppID][RootName].CommonModule, Module, {value: {}, enumerable: true});
                var SubWraper = [
                  '"use strict";',
                  'var Application = Platform.Applications["' + AppID + '"];',
                  'var Cube = Platform.Applications["' + AppID + '"]["' + RootName + '"];',
                  'var Module = Platform.Applications["' + AppID + '"]["' + RootName + '"].CommonModule["' + Module + '"];',
                  'var Dir = "' + NextPath + '";'
                ];
                Applications.Require(NextPath + '/' + FileName, SubWraper, true);
              }
            }
          }
}}}}}
  
Applications.BindCubeMethods = function(AppID, Cube) {
  var FileName = __ROOT + '/server/Cube.js';
  var SubWraper = [
    '"use strict";',
    'var Application = Platform.Applications["' + AppID + '"];',
    'var Cube = Platform.Applications["' + AppID + '"]["' + Cube + '"];',
    'Cube.Name = "' + Cube + '";'
  ]
  return Applications.Require(FileName, SubWraper, true);
}

Applications.CommonModule = function(ModuleName, AppID, Cube) {
  var Path = [Applications[AppID].Dir];
  Path.push(Cube);
  Path.push('Common/Modules');
  Path.push(ModuleName);

  var FileName = Path.join('/');

  var SubWraper = [
    '"use strict";',
    'var Application = Platform.Applications["' + AppID + '"];',
    'var Cube = Platform.Applications["' + AppID + '"]["' + Cube + '"];',
    'var Module = module.export = {};'
  ];
  
  return Applications.Require(FileName, SubWraper, true);
}

Applications.BuildModelStructure = function(AppID) {
  const Application = Applications[AppID];
  const ModelTypes = require("./ModelTypes.js");
  Application.ApplicationTypes = ModelTypes;
  
  var AppDir = Applications[AppID].Dir;
  let Files = fs.readdirSync(AppDir);
  for (let i=0; i<Files.length; i++) {
    var Cube = Files[i];
    let isDir = fs.statSync(AppDir + '/' + Cube).isDirectory();
    if(isDir) {
      var reg = /\.|\../;
      if (Cube.match(reg) == null) { 
        let CubeFile = AppDir + '/' + Cube + '/' + Cube + '.js';
        if (fs.existsSync(CubeFile)) {
          let CubeFiles = fs.readdirSync(AppDir + '/' + Cube);
          for (let i=0; i<CubeFiles.length; i++) {
            var Type = CubeFiles[i];
            var AppType = ModelTypes[Type];
            if(AppType) {
              Object.defineProperty(Application[Cube], Type, {value: {}, enumerable: true});
              let TypeFiles = fs.readdirSync(AppDir + '/' + Cube + '/' + Type);
              for (let i=0; i<TypeFiles.length; i++) {
                let Model = TypeFiles[i];
                let ModelFile = AppDir + '/' + Cube + '/' + Type + '/' + Model + '/ModelDefinition.js';
                if (fs.existsSync(ModelFile)) { 
                  const ModelDefinition = require(ModelFile);
                  const CommonModel = require('./Models/Common.js');
                  const NewModel = CommonModel(Application, ModelDefinition);
                  const TypeMethods = require('./Models/' + Type + '.js');
                  TypeMethods(NewModel);
                  Object.defineProperty(Application[Cube][Type], Model, {value: NewModel, enumerable: true});
                    if(ModelDefinition.Associations instanceof Object)  {
                      const HasMany = ModelDefinition.Associations.HasMany;
                      if(HasMany instanceof Array) {
                        for(let i=0; i<HasMany.length; i++) {
                          let AssDefinition = HasMany[i];
                          if(AssDefinition.Type && AssDefinition.Type == 'Collections') {
                            let AssModel = CommonModel(Application, AssDefinition);
                            Object.defineProperty(Application[Cube][Type][Model], AssDefinition.Name, {value: AssModel, enumerable: true});
                          }
                        }
                      }
                  }
}}}}}}}}}