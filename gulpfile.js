let gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  scss = require('gulp-sass'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  uglify = require('gulp-uglify'),
  autoprefixer = require('gulp-autoprefixer');

//compile and sync scss files
gulp.task('scss', () => {
  return gulp.src('./app/scss/**/*.scss')
    .pipe(plumber())
    .pipe(scss())
    .pipe(autoprefixer(['last 2 versions', '>1%'], { cascade: false }))
    .pipe(gulp.dest("./app/css"))
    .pipe(browserSync.reload({
      stream: true
    }));
});

//sync all you browsers
gulp.task('browserSync', () => {
  browserSync({
    server: { baseDir: 'app' },
    notify: false //delete notification
  })
});

//delete dist folder, and create it again after compiling
gulp.task('clean', function () {
  return del.sync('dist')
});

//watch changes in scss folder
gulp.task('watch', ['browserSync'], () => {
  gulp.watch('./app/scss/**/*.scss', ['scss']);
  gulp.watch('./app/*.html', browserSync.reload); //watch HTML
  gulp.watch('./app/js/*.js', browserSync.reload); //watch JS
});

gulp.task('html', function () {
  return gulp.src(['./app/*.html'], { base: './app' })
    .pipe(gulp.dest('./dist'));
});

// build for production
gulp.task('build', ['clean', 'scss', 'html'], () => {
  gulp.src('./app/css/main.css')
    .pipe(cssnano())
    .pipe(gulp.dest('./dist/css'));

  gulp.src('./app/js/**/*.js')
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));

  gulp.src('./app/img/**/*')
    .pipe(gulp.dest('./dist/img'));
});