(function(c,b){var a=function(){};a.controllers={};a.applications={};a.options={};a._loaded=[];a._resolvedNamespace=function(d){return a._namespace._provided[""+d];};a.resolve=function(d){if(!a._namespace._provided[d]){return d.replace(/\./gi,"/");}return false;};a._namespace=function(g){var h=(""+g).split(/\./),k=h.length,j=[],f=window||{};if(!a._namespace._provided){a._namespace._provided={};}if(a._namespace._provided[g]==g){throw new Error(g+" has already been defined.");}for(var e=0;e<k;e+=1){var d=h[e];if(!f[d]){j[e]=d;f[d]=function(){};a._namespace._provided[j.join(".")]=f[d];}f=f[d];}return f;};a.query=function(){return jQuery.apply(this,arguments);};a.queryFirst=function(){return a.query.apply(this,arguments)[0];};a.require=function(h,l){if(!$.isArray(h)){h=[h];}var k=h.length,m,g=0;var d=a.controllers;for(var f=0;f<k;f++){var j=h[f];m=a.options.baseSrc+a.resolve(j)+".js";a._loaded.push(j);$.getScript(m,function(){g++;});}var e=setInterval(function(){if(l&&g==k){clearInterval(e);l.call(this);}},25);};a.fetch=function(d,e){$.getScript(d,function(){if(e){e.apply(this,arguments);}});};a.define=function(e,d){if("function"==typeof d){d=d.call(this);}if(typeof e=="string"){a._namespace(e);a._loaded[e]=d;a.controllers[e]=d;}};a.create=function(d){if(typeof d=="undefined"){d={};if(!d.baseSrc){d.baseSrc="js/";}if(!d.mojoSrc){d.mojoSrc="../src";}}$.extend(this.options,d);return new Application();};a.extend=function(){var d=function(){};return function(f,e){d.prototype=e.prototype;f.prototype=new d();f.__super__=e.prototype;f.prototype.constructor=f;};};window.MOJO=a;})(window,document);MOJO.define("Request",function(){function a(e,b,d,c){this.paramsObj=e;this.callerObj=b;this.eventObj=d;this.controllerObj=c;}a.prototype.getController=function(){return this.controllerObj;};a.prototype.getContextElement=function(){return this.getController().getContextElement();};a.prototype.getCaller=function(){return this.callerObj;};a.prototype.getEvent=function(){return this.eventObj;};window.Request=a;return a;});MOJO.define("Controller",function(){function a(){this.contextElement=null;this.controllerClass=null;this.events;}a.prototype.onInit=function(){};a.prototype.onParamChange=function(){};a.prototype.params={};a.prototype.initialize=function(c,d,e){var b=this;b.contextElement=c;b.controllerClass=d;if("undefined"!=typeof e||!e){b.params=e;}$(b.events).each(function(j,i){var g=$(document),l=i[0],f=i[1],h=i[2],k=i[3];if(l=="context"){g=$(c);}$(g).delegate(f,h,function(m){var n=new Request({},this,m,b);if(typeof b.before!="undefined"&&typeof b.before[k]!="undefined"){b.before[k].call(b,n);}b.methods[k].call(MOJO.controllers[d],n);if(typeof b.after!="undefined"&&typeof b.after[k]!="undefined"){b.after[k].call(b,n);}});});b.onInit();};a.prototype.getContextElement=function(){if(!this.contextElement){return null;}return this.contextElement;};a.prototype.param=function(b,c){if("undefined"==typeof this.params){this.params={};}if(arguments.length>1){this.params[b]=c;this.onParamChange();return this;}else{return this.params[b];}};window.Controller=a;return a;});MOJO.define("Application",function(){function a(){if(!this.options){this.options={};}var b=this,c=b.options;c.locale="en_CA";c.plugins=[];c.pluginSrc="js/lib/plugins/";c.environment="dev";c.selector=jQuery||(function(){throw new Error("Unable to find jQuery");})();b.siteMap=[];}a.prototype.onComplete=function(){};a.prototype.configure=function(b,d){if(arguments.length>1){this.options[b]=d;if(this.options.environment=="dev"){try{console.info("Configure: ",b," -> ",d);}catch(c){}}return this;}else{return this.options[b];}};a.prototype.map=function(b,e){var c=this;var d=$(b);d.each(function(f,g){c.siteMap.push({context:g,init:e});});if("function"==typeof e){e.call(this,c);}return this;};a.prototype.setupController=function(c,b,g){var e=$(c);var d=MOJO.controllers[b];var f=new Controller(),d=$.extend(d,d.methods),d=$.extend(d,f);MOJO.controllers[b]=d;if(typeof d=="undefined"){throw new Error("Undefined Controller @ ",b);}d.initialize(c,b,g);if("undefined"==typeof c.mojoControllers){c.mojoControllers=[];}c.mojoControllers.push({controller:d});if(typeof d.after!="undefined"&&d.after.Start!="undefined"){d.after.Start.call(d,null);}};a.prototype.disconnectControllers=function(c){var b=this;$(b.siteMap).each(function(d,e){$(e.context).unbind().undelegate();});if("undefined"!=typeof c&&"function"==typeof c){c.apply(b);}};a.prototype.connectControllers=function(){var b=this,c=[];$(b.siteMap).each(function(e,d){var f;if("function"==typeof d.init){f=d.init.call(this);}else{f=d.init;}$(f).each(function(g,h){if(!MOJO.controllers.hasOwnProperty(h.controller)){c.push(h.controller);}else{MOJO._loaded[h.controller]=h.controller;}});});if(b.options.environment=="dev"){MOJO.require($.unique(c),function(){$(b.siteMap).each(function(e,d){if(b.options.environment=="dev"){try{console.log("Mapping ["+e+"]: ",d.context);}catch(g){}}var f=("function"==typeof d.init)?d.init.call(this):d.init;$(f).each(function(h,j){b.setupController(d.context,j.controller,j.params);});});});}};a.prototype.on=function(b,c){return function(){};};a.prototype.getPlugins=function(d){var b=this,c=b.options.pluginSrc;$(b.options.plugins).each(function(e,f){MOJO.fetch(c+f+".js");});if("undefined"!=typeof d&&"function"==typeof d){d.call(b);}};a.prototype.start=function(){var b=this;$(document).ready(function(){b.disconnectControllers(function(){if(b.options.plugins.length){b.getPlugins(function(){b.connectControllers();});}else{b.connectControllers();}b.onComplete();});});};a.prototype.remap=function(){var b=this;b.disconnectControllers(function(){b.connectControllers();b.onComplete();});};("undefined"==typeof window)?process.Application=a:window.Application=a;window.Application=a;return a;});