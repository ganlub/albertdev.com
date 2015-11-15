'use strict';

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    scsslint = require('gulp-scss-lint'),
    jshint = require('gulp-jshint'),
    del = require('del'),
    size = require('gulp-size'),
    imagemin = require('gulp-imagemin'),
    minifyCss = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    ghPages = require('gulp-gh-pages'),
    browserSync = require('browser-sync').create();

const reload = browserSync.reload;
var files = {
    sass: {
        input: 'src/styles/**/*.scss',
        output: 'dist/styles',
        tmp: '.tmp/styles'
    },
    js: {
        input: 'src/scripts/*js',
        output: 'dist/scripts',
        tmp: '.tmp/scripts'
    },
    html: {
        input: 'src/*.html',
        output: 'dist'
    }
};

var sassOptions = {
    outputStyle: 'exapnded'
};

var autoprefixerOptions = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('styles', function () {
  return gulp
    .src(files.sass.input)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions)) //autoprefixer
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(files.sass.tmp))
    .pipe(gulp.dest(files.sass.output))
    .pipe(size({title: 'styles'}))
    .pipe(browserSync.stream());
});

gulp.task('scss-lint', function() {
  gulp.src(files.sass.input)
    .pipe(scsslint());
});

gulp.task('js-hint', function() {
  return gulp.src(files.js.input)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', ['styles'], function(){
  browserSync.init({
    notify: false,
    server: ['.tmp', 'src']
  });

  gulp.watch(files.sass.input, ['scss-lint', 'styles']);
  gulp.watch(files.js.input, ['js-hint', 'scripts']).on('change', browserSync.reload);
  gulp.watch(files.html.input).on('change', browserSync.reload);
});


// Dist specific tasks

// Clean output directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(['src/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe(size({title: 'fonts'}));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(size({title: 'images'}));
});

gulp.task('videos', function () {
  return gulp.src(['src/videos/**'])
    .pipe(gulp.dest('dist/videos'))
    .pipe(size({title: 'videos'}));
});

gulp.task('html', function () {
  return gulp.src(files.html.input)
    .pipe(minifyHTML())
    .pipe(gulp.dest(files.html.output))
    .pipe(size({title: 'html'}));
});

gulp.task('scripts', function () {

  return gulp.src(files.js.input)
    .pipe(sourcemaps.init())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(files.js.tmp))
    .pipe(gulp.dest(files.js.output))
    .pipe(size({title: 'js'}));
});

gulp.task('copy', function () {
  return gulp.src([
    'src/*',
    '!src/*.html'
  ], {
    dot: true
  })
  .pipe(gulp.dest('dist'))
  .pipe(size({title: 'copy'}));
});

gulp.task('default', ['watch'], function() {

});

gulp.task('dist', ['clean'], function(cb) {
    runSequence('fonts', 'images', 'videos', 'js-hint', 'scss-lint', 'styles', 'html', 'scripts', 'copy', cb);
});

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});
