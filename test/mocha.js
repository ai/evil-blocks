$ = jQuery = require('jquery');

require('chai').should();

jsdom    = require('jsdom')
window   = jsdom.jsdom().createWindow();
document = window.document;
document.implementation.createHTMLDocument = function (html, url) {
    return jsdom.html(html);
};

$('body').html('<div id="fixtures"></div>')
