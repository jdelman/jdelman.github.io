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

/* JS */ gapi.loaded_4(function(_){var window=this;
var Rk=function(a,c,f,g,h){this.width=a;this.height=c;this.B=f;this.G=g;this.opacity=h},Sk=function(a,c,f,g){return new Rk(void 0==c?a.width:c,void 0==f?a.height:f,a.B,a.G,void 0==g?a.opacity:g)};Rk.prototype.equals=function(a){return this.width==a.width&&this.height==a.height&&this.B==a.B&&this.G==a.G&&this.opacity==a.opacity}; Rk.prototype.interpolate=function(a,c){var f=1-c;return new Rk(Math.round(this.width*f+a.width*c),Math.round(this.height*f+a.height*c),Math.round(this.B*f+a.B*c),Math.round(this.G*f+a.G*c),this.opacity*f+a.opacity*c)};
_.Tk=function(a){_.Oh.call(this,a);this.I=new _.bi(this)};_.J(_.Tk,_.Qh);
_.nC=function(a){var c=Number(a.Ka(200,"widgetWidth","width")),f=Number(a.Ka(100,"widgetHeight","height")),g=a.Ka("auto","corner"),h=a.Ka({},"menuCss"),l=a.Ka(!0,"hideOnClick");a.Pj=!!a.Ka(!0,"hideOnLeave");a.Bd=!!a.Ka((0,_.Pk)(),"useCss3Transition");a.Ph=!!a.Ka(!0,"allowOffset");var n=window.document.createElement("div");a.G=n;var q=_.LH(a);q.parentNode.appendChild(n);var t=window.document.createElement("div");a.Kh=t;n.appendChild(t);h.position="absolute";h.width=c+"px";h.height="0";h.border=h.border||
"1px solid #aaa";h.background=h.background||"#fff";h.zIndex=_.Uh(a);h.overflow="hidden";h.boxShadow=h.MozBoxShadow=h.webkitBoxShadow=h.boxShadow||"0 2px 2px rgba(0,0,0,0.3)";_.Mg(n,h);_.Mg(t,{left:"-1000px",top:"-1000px",position:"absolute",width:c+"px",height:f+"px"});a.vk=n.offsetWidth-c;a.wk=n.offsetHeight;h="auto"==g?["top","start"]:g.split("-");q=_.Eg(q);a.te="bottom"==h[0];a.Na="right"==h[1]||"left"!=h[1]&&q;a.ha=Uk(a,c,f,"auto"==g);a.Zc=_.D.setTimeout((0,_.H)(a.Gj,a),500);a.I.Q(n,"mouseover",
a.Yq);_.tr(a.I,n,"mouseout",a.Xq,!1,a);l&&_.D.setTimeout((0,_.H)(function(){this.Ei||this.I.Q(window.document,"click",this.zr)},a),0)};_.Tk.prototype.open=function(){_.nC(this);this.wb.qc(this.G);this.wb.ea("resize",(0,_.H)(this.resize,this));this.wb.fg("showMenu",(0,_.H)(this.Is,this));var a=this.wb.methods;a.setHideOnLeave=(0,_.H)(this.Zq,this);a.displayStateCallback&&(this.eg=a.displayStateCallback,delete a.displayStateCallback);this.wb.Pa(this.Kh,{height:"100%"});_.Xk(this,this.ha)};
_.Tk.prototype.open=_.Tk.prototype.open;_.Tk.prototype.Oe=function(a){this.Ei||(a=a||{},this.Kh.style.left="0",this.Kh.style.top="0",this.M&&(_.Tf(this.M),this.M=null),this.Zc&&(_.D.clearTimeout(this.Zc),this.Zc=null),Wk(this,(0,window.parseInt)(a.width,10)||(0,window.parseInt)(this.wb.width,10)||this.ha.width,(0,window.parseInt)(a.height,10)||(0,window.parseInt)(this.wb.height,10)||this.ha.height))};_.Tk.prototype.onready=_.Tk.prototype.Oe;
_.Tk.prototype.resize=function(a){this.Ei||Wk(this,(0,window.isNaN)(+a.width)?this.ha.width:+a.width,(0,window.isNaN)(+a.height)?this.ha.height:+a.height)};_.Tk.prototype.close=function(){this.Kb?NC(this):(this.Za=!0,KC(this))};_.Tk.prototype.close=_.Tk.prototype.close;_.Tk.prototype.Ka=function(a,c){for(var f,g=1,h=arguments.length;g<h&&(f=this.B[arguments[g]],void 0===f);++g);return void 0!==f?f&&"object"==typeof f?(g={},_.Ht(g,f),g):f:a};
var Uk=function(a,c,f,g){var h=_.LH(a),l=_.Yg(h.offsetParent);l.right-=a.vk;l.bottom-=a.wk;if(g){var n=h.offsetLeft;g=n+c<l.right;n=n+h.offsetWidth-c>=l.left;a.Na=a.Na?!g||n:!g&&n;n=h.offsetTop;g=n+f<l.bottom;n=n+h.offsetHeight-f>=l.top;a.te=a.te?!g||n:!g&&n}g=Vk(a.Na,h.offsetLeft,h.offsetWidth,c,l.left,l.right);a=Vk(a.te,h.offsetTop,h.offsetHeight,f,l.top,l.bottom);return new Rk(c,f,g,a,1)},Vk=function(a,c,f,g,h,l){return a?(a=c+f,Math.min(l-a,Math.max(h+g-a,0))):Math.max(h-c,Math.min(l-c-g,0))},
Wk=function(a,c,f){a.wb.rb().style.width=c+"px";a.wb.rb().style.height=f+"px";a.Kh.style.width=c+"px";a.Kh.style.height=f+"px";c=a.Ph?Uk(a,c,f,!1):Sk(a.fb,c,f);a.ha=c;a.wc||ZC(a,c)};_.k=_.Tk.prototype;_.k.Zq=function(a){this.Pj=!!a};_.k.Yq=function(){!this.wc&&this.Ld&&(_.D.clearTimeout(this.Ld),this.Ld=null)};
_.k.Xq=function(a){if(!(this.wc||this.Ld||!this.Pj||a.relatedTarget&&_.Yf(this.G,a.relatedTarget))){var c=_.Lg(this.G);a=a.clientY>c.top&&a.clientY<c.top+c.height?0:300;this.Ld=_.D.setTimeout((0,_.H)(this.Zb,this),a)}};_.k.zr=function(a){_.Th(this.G,a)||this.Zb()};_.k.Is=function(a){this.show(!!a||void 0===a)};_.k.show=function(a){a?!this.Ei&&this.Kb&&(this.wc=this.Kb=!1,_.Xk(this,this.ha)):this.Zb()};
_.Xk=function(a,c){Yk(a,Sk(c,void 0,0,0));_.D.setTimeout((0,_.H)(function(){this.wc||(this.ha=c,this.Bd&&_.Nk(this.G,"width 350ms cubic-bezier(.23, .50, .32, 1),height 350ms cubic-bezier(.23, .50, .32, 1),left 350ms cubic-bezier(.23, .50, .32, 1),top 350ms cubic-bezier(.23, .50, .32, 1),opacity 350ms cubic-bezier(.23, .50, .32, 1)"),ZC(this,c),this.pa(!0,!1),this.xu&&(_.D.clearTimeout(this.xu),this.Za=!1),this.xu=_.D.setTimeout((0,_.H)(this.pa,this,!0,!0),350))},a),0)};
_.Tk.prototype.Zb=function(){this.wc||KC(this)};
var KC=function(a){a.wc||(a.pa(!1,!1),ZC(a,Sk(a.fb,void 0,0,0)),a.wc=!0,a.xu&&_.D.clearTimeout(a.xu),a.xu=_.D.setTimeout((0,_.H)(function(){this.Kb=!0;this.Za?(NC(this),this.Za=!1):(this.Bd&&_.Nk(this.G,""),this.G.visibility="hidden",this.G.left="-1000px",this.G.top="-1000px");this.pa(!1,!0)},a),350))},NC=function(a){a.Ei=!0;_.eh(a.I);a.I=null;a.Ld&&(_.D.clearTimeout(a.Ld),a.Ld=null);a.po&&(_.D.clearTimeout(a.po),a.po=null);_.Tf(a.G);a.G=null;_.Tf(_.LH(a));a.Kh=null;a.M=null};
_.Tk.prototype.pa=function(a,c){var f=this.eg;f&&_.D.setTimeout(function(){f(a,c)},0)};_.Tk.prototype.Gj=function(){this.M=window.document.createElement("div");this.M.style.width=this.M.style.height="100%";this.M.style.position="absolute";this.M.style.background="url(//ssl.gstatic.com/ui/v1/activityindicator/loading_gs.gif) no-repeat "+(this.ha.width-19)/2+"px "+(this.ha.height-19)/2+"px";this.G.appendChild(this.M)};
var ZC=function(a,c){if(!a.wc)if(a.Bd)Yk(a,c);else{var f=(0,_.pa)()-20+350;a.po&&_.D.clearTimeout(a.po);a.zh(a.fb,c,f)}},Yk=function(a,c){var f=a.G,g=_.LH(a);f.style.left=a.Na?g.offsetLeft+g.offsetWidth+c.B-c.width+"px":g.offsetLeft+c.B+"px";f.style.width=c.width+"px";f.style.top=a.te?g.offsetTop+g.offsetHeight+c.G-c.height+"px":g.offsetTop+c.G+"px";f.style.height=c.height+"px";_.Ag(f,c.opacity);a.fb=c}; _.Tk.prototype.zh=function(a,c,f){this.po=null;if(!this.Ei&&!a.equals(c)){var g=(0,_.pa)();g>=f?Yk(this,c):(g=Math.min(1-(f-g)/350,1),Yk(this,a.interpolate(c,1-Math.pow(1-g,3))),this.po=_.D.setTimeout((0,_.H)(this.zh,this,a,c,f),20))}};

_.hA["slide-menu"]=function(a){var c=new _.Tk(_.FC(a)),f=new _.Zh(c);c.open=function(){};_.nC(c);a.attributes={height:"100%"};a.where=c.Kh;a.onClose=function(){c.close()};a.onRestyle=function(a){if(a){var f=!1;a.hasOwnProperty("showMenu")&&(c.Is(a.showMenu),f=!0);a.hasOwnProperty("setHideOnLeave")&&(c.Zq(a.setHideOnLeave),f=!0);f||c.resize(a)}};a.onCreate=function(a){a.ci=function(){return this.Zf("openerIframe")};f.wb=c.wb=a;a.qc(c.G);a.register("_ready",(0,_.H)(c.Oe,c),_.Vz);c.eg=function(c,f){!a.Ma()&& a.ds([c,f])};_.Xk(c,c.ha);f.open()}};

});
// Google Inc.


}
/*
     FILE ARCHIVED ON 21:50:08 Nov 10, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 01:40:42 Sep 02, 2020.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  load_resource: 207.955
  PetaboxLoader3.datanode: 69.255 (4)
  exclusion.robots.policy: 0.2
  RedisCDXSource: 17.0
  captures_list: 123.237
  esindex: 0.015
  exclusion.robots: 0.216
  PetaboxLoader3.resolve: 130.911
  LoadShardBlock: 67.474 (3)
  CDXLines.iter: 33.459 (3)
*/