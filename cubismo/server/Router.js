const os      = require("os");
const fs      = require('fs');
const mkdirp  = require('mkdirp');
const path    = require('path');
const express = require('express');
const router  = express();

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

module.exports.init = function() {

  router.use(express.static("../client"))
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(fileUpload());
  
  router.get('/:applicationId', function(req, res, next) {
    function sendWindow() {
      const view = fs.readFileSync('../client/window.html', 'UTF-8');
      res.send(view);
    }
  
    const applicationId = req.params.applicationId;
    if(applicationId != 'favicon.ico') {
      const application = Platform.applications[applicationId];
      if(!application) {
        Platform.initApplication("Just-In-Time")
        .then((application) => {
          // for(let key in application.Cubes) {
          //   const cube = application.Cubes[key];
          //   const start = cube.onStart;
          //   if(start) {
          //     start();
          //   }
          // }
          sendWindow();
        })
        .catch(err => {
          console.log(err);
        })
      } else {
        sendWindow();
      }
    }
  });
  
  router.get('/favicon.ico', function(req, res, next) {
    console.log('favicon');
  });

  return router;
}