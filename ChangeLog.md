# 0.6.3
* Add Slim 3.0 support (by Andrey Krivko).

# 0.6.2
* Fix IE 8 support (by Dmitry Klimensky).
* Fix event name in debugger (by Andrey Krivko).

## 0.6.1
* Fix debugger scope (by Andrey Krivko)

## 0.6 (Ranger Able, 27th January 1951)
* Add filters, which process block object before init was called.
* Most build-in features was moved to filter to be disableable.
* Listener `load on window` will call immediately, if page was already loaded.

## 0.5.1
* Fix block vitalizing, when multiple blocks was binded to same DOM node.

## 0.5 (RDS-1, 29th August 1949)
* Current event target was moved from first argument to `event.el`.
* Inside finder was moved from `@(selector)` to `@$(selector)`.
* Remove old function style API.
* Add `@@block` alias.
* Add debugger extension.
* Vitalize blocks on next tick after page ready.
* Don’t vitalize blocks twice.
* Method `evil.block.vitalize()` calls on `document` by default.
* Allow to use GitHub master in Bundler.
* Add Bower support.

## 0.4.2 (Zebra, 14th May 1948)
* Don’t listen bubbled events as block event.
* Change license to MIT.

## 0.4.1 (Yoke, 30th April 1948)
* Allow to listen body and window events from object style.

## 0.4 (X-Ray, 14th April 1948)
* Add new object style.

## 0.3.2 (Helen of Bikini, 25th July 1946)
* Fix searching elements inside several blocks (by Andrei Miroshnik).

## 0.3.1 (Gilda, 1st July 1946)
* Fix in multiple block copies on one page (by Andrei Miroshnik).

## 0.3 (Fat Man, 9th August 1945)
* Add shortcut to Slim to set data-role and class.
* Run callback on every block copy in page.

## 0.2 (Little Boy, 6th August 1945)
* Support non-Rails applications in gem.

## 0.1 (The Gadget, 16th July 1945)
* Initial release.
