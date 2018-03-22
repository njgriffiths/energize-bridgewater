	const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const newer = require('gulp-newer');
// const plumber = require('gulp-plumber');

// JS
const uglify = require('gulp-uglify');
const stripdebug = require('gulp-strip-debug');
const imagemin = require('gulp-imagemin');
// CSS
var compass = require('gulp-compass');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const assets = require('postcss-assets');

var del = require('del');
const htmlclean = require('gulp-htmlclean');
const browserSync = require('browser-sync');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const reload = browserSync.reload;


const folder = {
	src: 'app/',
	build: 'dist/'
};

// Compile JS/Sass
gulp.task('sass', () => {
	// compass needs to run sync (no 'return' statement)
	// or the watch task shuts down on error
  	gulp.src('app/scss/**/*.scss')
  		.pipe(compass({
  			config_file: './config.rb',
  			css: 'app/css',
  			sass: 'app/scss',
  			emitCompileError: true
  		}))
  		.on('error', (err) => {
  			gutil.log(err);
  		})
		.pipe(gulp.dest('app/css'))
		.pipe(reload({ stream: true }));
});
gulp.task('webpack', () => { 
	return webpackStream(webpackConfig)
		.pipe(gulp.dest('app/js'))
		.pipe(reload({ stream: true }));
});

// watch Sass & JS files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('watch', ['sass'], () => {
	browserSync({
		server: {
			baseDir: 'app'
		}
	});

	gulp.watch('app/scss/*.scss', ['sass']);
	gulp.watch('app/js/*.js', ['webpack']);
	gulp.watch('app/data/**/*.json', ['webpack']);
	gulp.watch('app/templates/**/*.hbs', ['webpack']);
	gulp.watch('app/*.html', browserSync.reload);
});


/*
* DISTRIBUTION TASKS
*/

// delete previous build folder contents
gulp.task('clean', function() {
	del([folder.build]);
});

// Image processing
gulp.task('images', () => {
	const output = folder.build + 'img/';
	return gulp.src(folder.src + 'img/**/*')
		.pipe(newer(output))
		.pipe(imagemin({ optimizationLevel: 5 }))
		.pipe(gulp.dest(output));
});

// favicon
gulp.task('favicons', () => {
	const output = folder.build;
	return gulp.src(folder.src + 'favicons/*')
		.pipe(gulp.dest(output));
});

// JS uglify
gulp.task('ugly-js', ['webpack'], () => {
	return gulp.src(folder.src + 'js/bundle.js')
		.pipe(stripdebug()) // remove logs * comments
		// .pipe(uglify()) // do this via webpackConfig
		.pipe(gulp.dest(folder.build + 'js/'));
});

// CSS uglify
gulp.task('ugly-css', ['images'], () => {
	const plugins = [
		assets({ loadPaths: ['images/'] }), // images
		cssnano(), // minify
		mqpacker() // merge media queries
	];

	return gulp.src(folder.src + 'css/**/*.css')
		.pipe(postcss(plugins))
		.pipe(gulp.dest(folder.build + 'css/'));
});

// HTML 
gulp.task('html', ['images'], () => {
	return gulp.src(folder.src + '/**/*.html')
		.pipe(newer(folder.build))
		.pipe(htmlclean())
		.pipe(gulp.dest(folder.build))
});

// build dist
gulp.task('build', ['clean', 'sass', 'webpack', 'html', 'favicons', 'ugly-css', 'ugly-js']);
