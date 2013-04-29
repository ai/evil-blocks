fs     = require('fs-extra')
url    = require('url')
exec   = require('child_process').exec
http   = require('http')
path   = require('path')
coffee = require('coffee-script')

project =

  package: ->
    JSON.parse(fs.readFileSync('package.json'))

  name: ->
    @package().name

  version: ->
    @package().version

  tests: ->
    fs.readdirSync('test/').
      filter( (i) -> i.match /\.coffee$/ ).
      map( (i) -> "test/#{i}" )

  libs: ->
    fs.readdirSync('lib/').map( (i) -> "lib/#{i}" )

  title: ->
    @name()[0].toUpperCase() + @name()[1..-1]

mocha =

  template: """
            <html>
            <head>
              <meta charset="UTF-8">
              <title>#title# Tests</title>
              <link rel="stylesheet" href="/style.css">
              #system#
              <script>
                chai.should();
                mocha.setup({ ui: 'bdd', ignoreLeaks: true });
                window.onload = function() {
                  mocha.run();
                };
              </script>
              #libs#
              #tests#
            <body>
              <div id="mocha"></div>
              <div id="fixtures"></div>
            </body>
            </html>
            """

  html: ->
    @render @template,
      system: @system()
      libs:   @scripts project.libs()
      tests:  @scripts project.tests()
      title:  project.title()

  render: (template, params) ->
    html = template
    for name, value of params
      html = html.replace("##{name}#", value.replace(/\$/g, '$$$$'))
    html

  scripts: (files) ->
    files.map( (i) -> "<script src=\"/#{i}\"></script>" ).join("\n  ")

  system: ->
    @scripts ['node_modules/jquery-browser/lib/jquery.js',
              'node_modules/mocha/mocha.js',
              'node_modules/chai/chai.js']

task 'server', 'Run test server', ->
  server = http.createServer (req, res) ->
    pathname = url.parse(req.url).pathname

    if pathname == '/'
      res.writeHead 200, 'Content-Type': 'text/html'
      res.write mocha.html()

    else if pathname == '/style.css'
      res.writeHead 200, 'Content-Type': 'text/css'
      res.write fs.readFileSync('node_modules/mocha/mocha.css')

    else if fs.existsSync('.' + pathname)
      file = fs.readFileSync('.' + pathname).toString()
      if pathname.match(/\.coffee$/)
        file = coffee.compile(file)
      if pathname.match(/\.(js|coffee)$/)
        res.writeHead 200, 'Content-Type': 'application/javascript'
      res.write file

    else
      res.writeHead 404, 'Content-Type': 'text/plain'
      res.write 'Not Found'
    res.end()

  server.listen 8000
  process.stdout.write("Open http://localhost:8000/\n")

task 'clean', 'Remove all generated files', ->
  fs.removeSync('build/') if fs.existsSync('build/')
  fs.removeSync('pkg/')   if fs.existsSync('pkg/')

task 'gem', 'Build RubyGem package', ->
  fs.removeSync('build/') if fs.existsSync('build/')
  fs.mkdirsSync('build/lib/assets/javascripts/')

  copy = require('fs-extra/lib/copy').copyFileSync
  gem  = project.name() + '-rails'

  gemspec = fs.readFileSync("#{gem}.gemspec").toString()
  gemspec = gemspec.replace('VERSION', "'#{project.version()}'")
  fs.writeFileSync("build/#{gem}.gemspec", gemspec)

  copy("ruby/#{gem}.rb",      "build/lib/#{gem}.rb")
  copy('README.md',          'build/README.md')
  copy('ChangeLog',          'build/ChangeLog')
  copy('LICENSE',            'build/LICENSE')
  for file in project.libs()
    copy(file, file.replace('lib/', 'build/lib/assets/javascripts/'))

  exec "cd build/; gem build #{gem}.gemspec", (error, message) ->
    if error
      process.stderr.write(error.message + "\n")
      process.exit(1)
    else
      fs.mkdirsSync('pkg/') unless fs.existsSync('pkg/')
      gemFile = fs.readdirSync('build/').filter( (i) -> i.match(/\.gem$/) )[0]
      copy('build/' + gemFile, 'pkg/' + gemFile)
      fs.removeSync('build/')
