require 'pathname'

package = Pathname(__FILE__).dirname.join('package.json').read
version = package.match(/"version": "([\d\.]+)",/)[1]

Gem::Specification.new do |s|
  s.platform    = Gem::Platform::RUBY
  s.name        = 'evil-blocks-rails'
  s.version     = version
  s.summary     = 'Tiny JS framework for web pages to split your app ' +
                  'to independent blocks'

  s.files            = ['lib/evil-blocks-debug.js', 'lib/evil-blocks.js',
                        'lib/evil-blocks-rails.rb',
                        'LICENSE', 'README.md', 'ChangeLog.md']
  s.extra_rdoc_files = ['LICENSE', 'README.md', 'ChangeLog.md']
  s.require_path     = 'lib'

  s.author   = 'Andrey Sitnik'
  s.email    = 'andrey@sitnik.ru'
  s.homepage = 'https://github.com/ai/evil-blocks'
  s.license  = 'MIT'

  s.add_dependency 'sprockets', '>= 2'
end
