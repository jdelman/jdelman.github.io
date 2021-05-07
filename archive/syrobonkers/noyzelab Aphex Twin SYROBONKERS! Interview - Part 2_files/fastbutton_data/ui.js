// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3.0
// script for wayback-ui.html
function show_donation_banner() {
  var cookies = document.cookie.split(/\s*;\s*/);
  var show = true;
  for (var i = 0; i < cookies.length; i++) {
    var cv = cookies[i].split("=");
    if (cv[0] == "donation") {
      show = !(cv[1] == "x");
      break;
    }
  }
  if (show) $('#donate_banner').css('display', 'table');
}  
// @license-end
