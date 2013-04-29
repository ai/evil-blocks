# encoding: utf-8

Gem::Specification.new do |s|
  s.name        = 'evil-blocks-rails'
  s.version     = VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ['Andrey "A.I." Sitnik']
  s.email       = ['andrey@sitnik.ru']
  s.homepage    = 'https://github.com/ai/evil-blocks'
  s.summary     = 'Tiny framework for web pages to split your app ' +
                  'to separated blocks'
  s.description = 'Evil Block is a tiny framework for web pages. ' +
                  'It split your application to separated blocks and isolate ' +
                  'their styles and scripts.'

  s.add_dependency 'sprockets', '>= 2'

  s.files            = ['lib/assets/javascripts/evil-blocks.js',
                        'lib/evil-blocks-rails.rb',
                        'LICENSE', 'README.md', 'ChangeLog']
  s.extra_rdoc_files = ['LICENSE', 'README.md', 'ChangeLog']
  s.require_path     = 'lib'
end
