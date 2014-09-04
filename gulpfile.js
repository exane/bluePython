var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var sass = require("gulp-sass");
var livereload = require("gulp-livereload");


gulp.task('browserify', function() {
    browserify('./src/js/app.js', {standalone: "name"})
        .bundle().on("error", function(err){
            console.log(err);
        })
        .pipe(source('bundle.js').on("error", function(err){
            console.log(err);
        }))
        .pipe(gulp.dest('./build/').on("error", function(err){
            console.log(err);
        }));
});

gulp.task('sass', function () {
    gulp.src('./src/scss/*.scss')
        .pipe(sass().on("error", function(err){
            console.log(err);
        }))
        .pipe(gulp.dest('./build').on("error", function(err){
            console.log(err);
        }))
        .pipe(livereload().on("error", function(err){
            console.log(err);
        }));
});

gulp.task("watch", function(){
    gulp.watch("./src/js/*.js", ["browserify"]);
    gulp.watch("./src/data/*.js", ["browserify"]);
    gulp.watch('./src/scss/*.scss', ["sass"]);
})

gulp.task("default", ["browserify", "sass", "watch"]);