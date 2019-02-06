import gulp from 'gulp'
import loadPlugins from 'gulp-load-plugins'
import del from 'del'
import path from 'path'
import webpackStream from 'webpack-stream'
import manifest from './package.json'

// Load all of our Gulp plugins
const $ = loadPlugins()

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions
const mainFile = manifest.main
const destinationFolder = path.dirname(mainFile)
const exportFileName = path.basename(mainFile, path.extname(mainFile))

function cleanDist (done) {
  del([destinationFolder]).then(() => done())
}

function cleanTmp (done) {
  del(['tmp']).then(() => done())
}

function onError () {
  $.util.beep()
}

// Lint a set of files
function lint (files) {
  return gulp.src(files)
    .pipe($.plumber())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .on('error', onError)
}

function lintSrc () {
  return lint('src/**/*.js')
}

function lintGulpfile () {
  return lint('gulpfile.babel.js')
}

function build () {
  return gulp.src(path.join('src', config.entryFileName))
    .pipe($.plumber())
    .pipe(webpackStream({
      mode: 'production',
      output: {
        filename: exportFileName + '.js',
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } }
        ]
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(destinationFolder))
    .pipe($.filter(['*', '!**/*.js.map']))
    .pipe($.rename(exportFileName + '.min.js'))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder))
}

// Remove the built files
gulp.task('clean', cleanDist)

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp)

// Lint our source code
gulp.task('lint-src', lintSrc)

// Lint this file
gulp.task('lint-gulpfile', lintGulpfile)

// Lint everything
gulp.task('lint', gulp.parallel('lint-src', 'lint-gulpfile'))

// Build two versions of the library
gulp.task('build', gulp.series('lint', 'clean', build))

// An alias of lint
gulp.task('default', gulp.series('lint'))
