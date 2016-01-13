jsdom    = require('jsdom');
window   = window = jsdom.jsdom().defaultView;
document = window.document;

global.location = { href: '' };

$ = jQuery = require('jquery');

$('body').html('<div id="fixtures"></div>');
