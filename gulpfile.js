var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename')

gulp.task('default', function () {
    gulp.start('build');
});

gulp.task('build', function () {
    return gulp.src('src/predicate.js')
        .pipe(gulp.dest('dist'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
