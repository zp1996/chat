const gulp = require("gulp"),
	babel = require("gulp-babel"),
	jshint = require("gulp-jshint"),
	less = require("gulp-less"),
	uglify = require("gulp-uglify"),
	cleanCss = require("gulp-clean-css"),
	imagemin = require("gulp-imagemin"),
	filePath = [
		`${__dirname}/src/less/**/*.less`,
		`${__dirname}/src/js/**/*.js`,
		`${__dirname}/src/images/*`
	];

gulp.task("less", () => {
	return gulp.src(filePath[0])
						 .pipe(less())
						 .pipe(cleanCss())    // 上线后打开
						 .pipe(gulp.dest("./build/css"));
});

gulp.task("image", () => {
	return gulp.src(filePath[2])
						 .pipe(imagemin())
						 .pipe(gulp.dest("./build/images"));
});

gulp.task("js", () => {
	return gulp.src(filePath[1])
						 .pipe(babel({
						 		presets: ['es2015']
						 }))
						 .pipe(jshint())
						 .pipe(uglify())    // 上线后打开
						 .pipe(gulp.dest("./build/js"));
});

gulp.watch(filePath, ["less", "js", "image"]);

gulp.task("default", ["less", "js", "image"]);