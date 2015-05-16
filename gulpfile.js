var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
 
gulp.task('sass', function () {
    return sass('public/css/', { 'style': 'expanded' }) 
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
    .pipe(gulp.dest('public/css/'));
});

gulp.task('watch', function(){
    gulp.watch('public/css/*.scss', ['sass']);
});