/* globals Tools Log Application Model*/

Model.newFolder = function(predefinedValues, callback) {
  
  const newInstance = this.build(predefinedValues);
  newInstance.isFolder = true;
  if(predefinedValues) {
    for(let key in predefinedValues) {
      if(!newInstance[key] && this.associations[key]) {
        newInstance[key] = predefinedValues[key];
      }
    }
  }
  
  return newInstance;
}