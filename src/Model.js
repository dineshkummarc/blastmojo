mojo.define("mojo.Model", function() {

"use strict";

var $ = jQuery, Model = function() {};
  

Model.set = function(key, value) {
  //find in the DOM, if it's an element, pass it into the templating engine
  //if it's not an HTML element, then we can just store it in DOM
  var models = mojo.query('*[modelSource="' + key + '"]');
  mojo._namespace(key);
  if (models.length) {
    var contentOfModel;
    $(models).each(function(index, model) {

      model.mojoTemplate = $(model).html();
      $(model).html("");
      var content = mojo.template(model.mojoTemplate, value);
      
      
      $(models).html(content);
      contentOfModel = $(models).html();
    });

    return contentOfModel;
    
  } else {
  	
  	window[key] = value;
  	return window[key];
  }
};

Model.get = function(key) {
  return mojo.ModelRegistry[key];
};

Model.remove = function(key) {
  delete mojo.ModelRegistry[key];
};
  
  window.mojo.Model = Model;
  window.mojo.ModelRegistry = {};
  if (window.MOJO) window.MOJO.Model = window.mojo.Model;
});