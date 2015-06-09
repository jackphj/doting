var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var spriter = require('gulp-css-spriter');
 
gulp.task('sass', function () {
    return sass('public/css/', { 'style': 'expanded' }) 
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
    .pipe(gulp.dest('public/css/'));
});

gulp.task('watch', function(){
    gulp.watch('public/css/mobile/*.scss', ['sass']);
});



/**
 * 图片合并
 * 雪碧图
 *
 */
gulp.task('spr', function() {

    var timestamp = +new Date();
    //需要自动合并雪碧图的样式文件
    return gulp.src('public/css/style.css')
        .pipe(spriter({
            // 生成的spriter图片的位置
            'spriteSheet': 'public/images/bgs_' + timestamp + '.png',
            // CSS里生成样式文件图片引用地址的路径
            // 如下将生产：backgound:url(../images/sprite20324232.png)
            'pathToSpriteSheetFromCSS': '../images/bgs_' + timestamp + '.png'
        }))
        //产出路径
        .pipe(gulp.dest('public/css/'));
});
