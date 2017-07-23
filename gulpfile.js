var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var cache = require('gulp-cache');
var images = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence') ;
var autoprefixer = require('gulp-autoprefixer');


gulp.task('sass', function() {
 return	gulp.src('app/scss/**/*.scss')
	  .pipe(sass())
	  .pipe(autoprefixer())
	  .pipe(gulp.dest('app/css'))
	  .pipe(browserSync.reload({
		  stream: true
	  }))
});


gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
})


gulp.task('useref' , function() {
	return gulp.src('app/*.html')
	 .pipe(useref())
	 .pipe(gulpIf('*.js', uglify()))
	 .pipe(gulpIf('*.css', cssnano()))
	 .pipe(gulp.dest('dist'))
});


gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
 
  .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
});


gulp.task('clean:dist', function() {
	return del.sync('dist');
});



gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], 
	  callback
	)
})

gulp.task('default', function(callback) {
	runSequence(['sass', 'useref', 'images', 'fonts'], 
	  callback
	)
})




gulp.task('watch', ['browserSync', 'sass'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});















