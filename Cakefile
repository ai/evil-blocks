fs   = require('fs-extra')
url  = require('url')
exec = require('child_process').exec
http = require('http')
path = require('path')

project =

  package: ->
    JSON.parse(fs.readFileSync('package.json'))

  name: ->
    @package().name

  version: ->
    @package().version

  tests: ->
    fs.readdirSync('test/')
      .filter (i) -> i.match /\.coffee$/
      .map    (i) -> "test/#{i}"

  libs: ->
    fs.readdirSync('lib/').sort().reverse()
      .filter (i) -> i.indexOf('.js') != -1
      .map    (i) -> "lib/#{i}"

  title: ->
    capitalize = (s) -> s[0].toUpperCase() + s[1..-1]
    @name().split('-').map( (i) -> capitalize(i) ).join(' ')

mocha =

  template: """
            <html>
            <head>
              <meta charset="UTF-8">
              <title>#title# Tests</title>
              <link rel="stylesheet" href="/style.css">
              #system#
              <script>
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
    @scripts ['node_modules/jquery/dist/jquery.js',
              'node_modules/should/should.js',
              'node_modules/mocha/mocha.js']

task 'server', 'Run test server', ->
  coffee = require('coffee-script')

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
  fs.removeSync('pkg/') if fs.existsSync('pkg/')
  for file in fs.readdirSync('./')
    fs.removeSync(file) if file.match(/\.gem$/)

task 'min', 'Create minimized version of library', ->
  uglify = require('uglify-js')

  invoke('clean')
  fs.mkdirsSync('pkg/')

  for file in project.libs()
    name = file.replace(/^lib\//, '').replace(/\.js$/, '')
    fs.copySync(file, "pkg/#{name}-#{project.version()}.min.js")

  packages = fs.readdirSync('pkg/').filter( (i) -> i.match(/\.js$/) )
  for file in packages
    min = uglify.minify('pkg/' + file)
    fs.writeFileSync('pkg/' + file, min.code)
