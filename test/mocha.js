jsdom    = require('jsdom')
window   = jsdom.jsdom().createWindow();
document = window.document;
global.document.implementation.createHTMLDocument = function (html, url) {
    return jsdom.html(html);
};

$ = jQuery = require('jquery');

$('body').html('<div id="fixtures"></div>');
