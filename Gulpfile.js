'use strict';

var gulp           = require('gulp');
var $              = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var koutoSwiss     = require('kouto-swiss');
var del            = require('del');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('views', function() {
  return gulp.src(['src/views/index.jade'])
    .pipe($.plumber())
    .pipe($.jade({ pretty:true }))
    .pipe(gulp.dest('public/'))
    .pipe($.livereload());
});

gulp.task('styles', function() {
  return gulp.src('src/styles/main.styl')
    .pipe($.plumber())
    .pipe($.stylus({
      use : [koutoSwiss()]
    }))
    .pipe($.autoprefixer({ browsers:AUTOPREFIXER_BROWSERS }))
    .pipe(gulp.dest('public/styles'))
    .pipe($.livereload());
});

gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
   .pipe($.plumber())
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe(gulp.dest('public/scripts'))
    .pipe($.livereload());
});


gulp.task('vendor', function() {
    return gulp.src('public/vendor/*.js')
      .pipe($.flatten())
      .pipe(gulp.dest('dist/scripts/vendor'));
});

gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
});

gulp.task('images', function() {
  return gulp.src('public/images/**/*')
    .pipe($.flatten())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('install', function() {
  return gulp.src('./bower.json')
    .pipe($.install());
});

gulp.task('html', ['styles', 'scripts'], function() {
  var assets = $.useref.assets();
  return gulp.src('public/*.html')
    .pipe(assets)
    .pipe($.plumber())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
});

gulp.task('extras', function() {
  return gulp.src(['public/*.*', '!public/*.html'], {
      dot: true
    })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  del(['dist'],function(err, deletedFiles) {
    console.log('Files deleted:', deletedFiles.join(', '));
  });
});

gulp.task('connect', function() {
  var connect      = require('connect');
  var http         = require('http');
  var app          = connect();
  var serverStatic = require('serve-static');

  app
    .use(require('connect-livereload')({
      port: 35729
    }))
    .use(serverStatic('./public'));

  http.createServer(app).listen(3000)
});

gulp.task('serve', ['connect'], function() {
  require('opn')('http://localhost:3000');
});

gulp.task('build',['html','images','fonts','vendor','extras'], function() {
  var s = $.size();

  gulp.src('dist/**/*')
    .pipe(s)
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      return $.util.log(
        $.util.colors.green(':)') +
        $.util.colors.cyan(' total size ') +
        $.util.colors.magenta(s.prettySize)
      );
    });
});

gulp.task('watch',['connect','serve'], function() {
     $.livereload.listen();

    gulp.watch('src/views/**/*.jade' ,['views']);
    gulp.watch('src/styles/**/*.styl',['styles']);
    gulp.watch('src/scripts/**/*.js' ,['scripts']);
});

gulp.task('init',['views','styles','scripts','install'], function() {
  var s = $.size();

  gulp.src('public/**/*')
    .pipe(s)
    .pipe(gulp.dest('public'))
    .on('end', function() {
      return $.util.log(
        $.util.colors.green(':)') +
        $.util.colors.cyan(' total size ') +
        $.util.colors.magenta(s.prettySize)
      );
    });
});
