require('chai').should();

jsdom    = require('jsdom')
window   = jsdom.jsdom().createWindow();
document = window.document;
global.document.implementation.createHTMLDocument = function (html, url) {
    return jsdom.html(html);
};

require('jquery')(window);
$ = jQuery = window.jQuery;

$('body').html('<div id="fixtures"></div>');
