//==============================================================================
//  Interface Enums
//==============================================================================
var controlType = {
    formField      : 0,
    formButton     : 1,
    formTable      : 2,
    formGroup      : 3,
    formDecoration : 4
}
module.exports.controlType = controlType

var formFieldType = {
    inputField       : 0,
    labelField       : 1,
    radioButtonField : 2,
    radioButtonField : 3
}
module.exports.formFieldType = formFieldType

var formGroupType = {
    usualGroup : 0,
    pages      : 1,
    page       : 2
}
module.exports.formGroupType = formGroupType

var childFormItemsGroup = {
    vertical   : 'vertical',
    horizontal : 'horizontal'
}
module.exports.childFormItemsGroup = childFormItemsGroup