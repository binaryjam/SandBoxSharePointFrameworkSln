var gulp = require("gulp");
var debug = require("gulp-debug");
var concat = require('gulp-concat');

var destination = "";

gulp.task('build', ['buildlocal','buildSP']);

gulp.task('buildlocal', ['buildhtmllocal','buildcssboth','buildjsboth']);
//Depends on build local to call the build css/js both save running twice
// this can be made faster, tasks that return as stream (and other things) can
//be ran async, i had trouble ensuring packagesp ran last so removed that for now
gulp.task('buildSP' , [
            'buildhtmlsp',
            //'buildcssboth','buildjsboth',
            'packagesp']);




gulp.task('buildhtmllocal', function () {
     gulp.src(['./WebComponents/.container/localtop.htm',
                     './WebComponents/.container/loader.htm', 
                     './WebComponents/src/webpartcontent.htm',
                     './WebComponents/.container/localbottom.htm'])
        .pipe(concat('loader.htm'))
        .pipe(gulp.dest('./WebComponents/buildlocal'));
});

gulp.task('buildhtmlsp', function () {
     gulp.src(['./WebComponents/.container/loader.htm', 
                     './WebComponents/src/webpartcontent.htm'])
        .pipe(concat('loader.htm'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildcssboth', function () {
     gulp.src(['./WebComponents/src/css/*.css'])
        .pipe(debug({title: 'cssbuild:'}))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildjsboth', function () {
    gulp.src(['./WebComponents/src/js/*.js'])
        .pipe(debug({title: 'jsbuild:'}))
        .pipe(concat('bundle.js'))
//      Add some uglifier here if you want
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('packagesp', function () {
      gulp.src(['./WebComponents/buildSP/*.*'])
        .pipe(debug({title: 'packagesp:'}))
        .pipe(gulp.dest('./SandBoxSharePointFramework/CodeModule'));
     
    
    //Write code here to copy the builtSP files to the Sharepoint Project Proper
    //Write code to automatically edit the elements.xml to add and update all the files
    //Write code to call msbuild to create WSP file so no loading VS Studio huzzah
    //  or write horrible DDF file and makecab it- arrrrgh
});

