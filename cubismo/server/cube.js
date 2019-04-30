/* globals __ROOT Tools Platform Application Cube */

Cube.Form = function(FormName) {
  var Form = Platform.Applications.InitForm(FormName, Application, Cube);
  return Form;
}
