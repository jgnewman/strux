import fs from 'fs';
import gulp from 'gulp';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sequence from 'run-sequence';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import server from './server/server';
import locations from './gulpconfig.json';

/*
 * Runs through the sequence of transpiling and bundling
 * the visitor app.
 */
gulp.task('build:js', () => {
  return browserify(locations.appEntry)
    .transform('babelify', {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source(locations.appOutput.fileName))
    .pipe(buffer())
    .pipe(gulp.dest(locations.appOutput.dest));
});

/*
 * Runs through the process of compiling the SCSS.
 */
gulp.task('build:styles', () => {
  return gulp.src(locations.stylesEntry)
    .pipe(sass())
    .pipe(gulp.dest(locations.stylesOutput.dest));
});

/*
 * Sets up all file watchers and runs their respective
 * processes when changes occur.
 */
gulp.task('watch:all', done => {
  gulp.watch(locations.appSrc, () => sequence('build:js'));
  gulp.watch(locations.stylesSrc, () => sequence('build:styles'));
  gulp.watch([
    locations.serverSrc,
    locations.gulpfile,
    locations.package,
    locations.config
  ], () => sequence('refresh:server'));
  done();
});

/*
 * Initialize the server.
 */
gulp.task('server', () => {
  server.listen(locations.serverPort, function(){
    console.log(`Server listening on port ${locations.serverPort}.`);
  });
});

/*
 * Stops and restarts the server.
 */
gulp.task('refresh:server', done => {
  // server.close();
  // sequence('server');
  // done();
});

/*
 * Runs a sequence that builds compiles all files.
 */
gulp.task('build', () => {
  return sequence(
    'build:js',
    'build:styles'
  );
});

/*
 * Runs a sequence that builds compiles all files and serves
 * them up.
 */
gulp.task('dev', () => {
  return sequence(
    'build:js',
    'build:styles',
    'watch:all',
    'server'
  );
});
