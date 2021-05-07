var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");


define("layouts/error",["require","exports","module","config","models/exception","lib/view","layouts/error.tmpl","layouts/error.css"],function(a,b,c){function h(a){a.preventDefault(),window.location.href=window.location.href}function i(a){a.preventDefault(),e.get("router").reload()}var d,e=a("config"),f=a("models/exception"),g=a("lib/view");d=c.exports=g.extend({template:a("layouts/error.tmpl"),css:a("layouts/error.css"),ModelClass:f,className:"error g-box-full g-background-default g-shadow-inset",events:{"click .error__reload":h,"click .error__back":i},getTemplateData:function(a){return{message:a.message,is_widget_ready:e.get("widgetReady")}}})}),
define("layouts/error.tmpl",["vendor/handlebars-runtime"],function(){return require("vendor/handlebars-runtime").template(function(a,b,c,d,e){function o(a,b){var c="",d;c+=" <p>",d=a.message,typeof d===l?d=d.call(a,{hash:{}}):d===n&&(d=m.call(a,"message",{hash:{}}));if(d||d===0)c+=d;return c+="</p>\n",c}c=c||a.helpers;var f="",g,h,i,j,k=this,l="function",m=c.helperMissing,n=void 0;g=b.message,h=c["if"],j=k.program(1,o,e),j.hash={},j.fn=j,j.inverse=k.noop,g=h.call(b,g,j);if(g||g===0)f+=g;return f+='\n<a class="g-sc-logo" href="https://web.archive.org/web/20141112100129/http://soundcloud.com" title="Play on SoundCloud">SoundCloud.com</a>\n',f})}),
define("layouts/error.css",["require","exports","module"],function(a,b,c){var d=c.exports=document.createElement("style"),e=".error{text-align:center;padding:50px}.error__message{line-height:20px}.error>.g-sc-logo{display:inline-block}";d.styleSheet?d.styleSheet.cssText=e:d.appendChild(document.createTextNode(e)),e=null})

}
/*
     FILE ARCHIVED ON 10:01:29 Nov 12, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 01:40:47 Sep 02, 2020.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  PetaboxLoader3.resolve: 358.804 (2)
  esindex: 0.014
  exclusion.robots.policy: 0.2
  RedisCDXSource: 0.871
  load_resource: 422.407
  LoadShardBlock: 230.186 (3)
  PetaboxLoader3.datanode: 197.073 (5)
  CDXLines.iter: 35.766 (3)
  exclusion.robots: 0.214
  captures_list: 370.485
*/