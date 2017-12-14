var gulp = require('gulp')
var clean = require('gulp-clean')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var fs = require('fs')

function standalone(name, entry, exportName) {
  return browserify(entry, { debug: true, standalone: exportName || name })
    .bundle()
    .pipe(fs.createWriteStream('./dist/'+ name.replace(/_/g, '-') +'.js'))
}

gulp.task('bundle:snabbdom', function() {
  return standalone('snabbdom_patch', './snabbdom.bundle.js', 'snabbdom')
})

gulp.task('bundle:snabbdom:init', function() {
  return standalone('snabbdom', './snabbdom.js')
})

gulp.task('bundle:snabbdom:h', function() {
  return standalone('h', './h.js')
})

gulp.task('bundle:snabbdom:tovnode', function() {
  return standalone('tovnode', './tovnode.js')
})

gulp.task('bundle:module:class', function() {
  return standalone('snabbdom_class', './modules/class.js')
})

gulp.task('bundle:module:dataset', function() {
  return standalone('snabbdom_dataset', './modules/dataset.js')
})

gulp.task('bundle:module:props', function() {
  return standalone('snabbdom_props', './modules/props.js')
})

gulp.task('bundle:module:attributes', function() {
  return standalone('snabbdom_attributes', './modules/attributes.js')
})

gulp.task('bundle:module:style', function() {
  return standalone('snabbdom_style', './modules/style.js')
})

gulp.task('bundle:module:eventlisteners', function() {
  return standalone('snabbdom_eventlisteners', './modules/eventlisteners.js')
})

gulp.task('bundle', [
  'bundle:snabbdom',
  'bundle:snabbdom:init',
  'bundle:snabbdom:h',
  'bundle:snabbdom:tovnode',
  'bundle:module:attributes',
  'bundle:module:class',
  'bundle:module:dataset',
  'bundle:module:props',
  'bundle:module:style',
  'bundle:module:eventlisteners'
])

gulp.task('compress', ['bundle'], function() {
  return gulp.src(['dist/*.js', '!dist/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
})

gulp.task('clean', function() {
  return gulp.src('dist/*.*', {read: false})
    .pipe(clean())
})

gulp.task('default', ['bundle'])
