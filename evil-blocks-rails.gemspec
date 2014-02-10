Gem::Specification.new do |s|
  s.platform    = Gem::Platform::RUBY
  s.name        = 'evil-blocks-rails'
  s.version     = VERSION
  s.summary     = 'Evil Block is a tiny JS framework for web pages ' +
                  'to split your app to separated blocks'

  s.files            = ['lib/assets/javascripts/evil-blocks.debug.js',
                        'lib/assets/javascripts/evil-blocks.js',
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
