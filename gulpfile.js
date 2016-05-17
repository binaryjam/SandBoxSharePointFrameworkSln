var gulp = require("gulp");
var debug = require("gulp-debug");
var concat = require('gulp-concat');
var gulpfn = require("gulp-fn");
var xeditor = require("gulp-xml-editor");
var prettyData = require('gulp-pretty-data');
var destination = "";

gulp.task('build', ['buildlocal', 'buildSP']);

gulp.task('buildlocal', ['buildhtmllocal', 'buildcssboth', 'buildjsboth', 'buildimgboth']);
//Depends on build local to call the build css/js both save running twice
// this can be made faster, tasks that return as stream (and other things) can
//be ran async, i had trouble ensuring packagesp ran last so removed that for now
gulp.task('buildSP', [
        'buildhtmlsp',
        //'buildcssboth','buildjsboth',
        'packagesp'
]);




gulp.task('buildhtmllocal', function () {
        gulp.src(['./WebComponents/.container/localtop.htm',
                './WebComponents/.container/loader.htm',
                './WebComponents/src/webpartcontent.htm',
                './WebComponents/.container/localbottom.htm'
        ])
                .pipe(concat('loader.htm'))
                .pipe(gulp.dest('./WebComponents/buildlocal'));
});

gulp.task('buildhtmlsp', function () {
        gulp.src(['./WebComponents/.container/loader.htm',
                './WebComponents/src/webpartcontent.htm'
        ])
                .pipe(concat('loader.htm'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildcssboth', function () {
        gulp.src(['./WebComponents/src/css/*.css'])
                .pipe(debug({
                        title: 'cssbuild:'
                }))
                .pipe(concat('bundle.css'))
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildjsboth', function () {
        gulp.src(['./WebComponents/src/js/*.js'])
                .pipe(debug({
                        title: 'jsbuild:'
                }))
                .pipe(concat('bundle.js'))
                //      Add some uglifier here if you want
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildimgboth', function () {
        gulp.src(['./WebComponents/src/images/*.*'])
                .pipe(debug({
                        title: 'imgbuild:'
                }))
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart/images'))
                .pipe(gulp.dest('./WebComponents/buildSP/images'));

});

var elementFiles = [];

gulp.task('packagesp', ['packagesp1','packagesp2', 'packagesp3','prettify']);

gulp.task('prettify', ['packagesp1'],function() {
  return gulp.src("./SandBoxSharePointFramework/CodeModule/Elements.xml")
    .pipe(prettyData({type: 'prettify'}))
    .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

gulp.task('packagesp1',  ['packagesp2', 'packagesp3'], function () {
        //Clear out all the File objects in the XML
     return   gulp.src("./SandBoxSharePointFramework/CodeModule/Elements.xml")
                .pipe(xeditor(function (xml, xmljs) {
                        var node = xml.find('//xmlns:File', 'http://schemas.microsoft.com/sharepoint/');
                        for (var i = 0; i < node.length; i++) {
                                node[i].remove();
                        }
                        var module = xml.get('//xmlns:Module', 'http://schemas.microsoft.com/sharepoint/');
                        for (var i = 0; i < elementFiles.length; i++) {
                                module.node('File')
                                        .attr({ ReplaceContent: 'TRUE' })
                                        .attr({ Path: elementFiles[i].path })
                                        .attr({ Url: elementFiles[i].Url });
                        }


                        return xml;
                }))
                .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

gulp.task('packagesp2', function () {

    return    gulp.src(['./WebComponents/buildSP/*.*'])
                .pipe(gulp.dest('./SandBoxSharePointFramework/CodeModule'))
                .pipe(gulpfn(function (file) {
                        var fname = file.path.substring(file.base.length + 1);
                        console.log("Addng" + fname);
                        elementFiles.push({ "name": fname, path: 'CodeModule\\' + fname, "Url": "SBFrameWork/SandboxFrameworkPart/" + fname });
                }
                ));
});

gulp.task('packagesp3', function () {
    return    gulp.src(['./WebComponents/buildSP/images/*.*'])
                .pipe(gulp.dest('./SandBoxSharePointFramework/CodeModule/images'))
                .pipe(gulpfn(function (file) {
                        var fname = file.path.substring(file.base.length + 1);
                        console.log("Addng" + fname);
                        elementFiles.push({ "name": fname, path: 'CodeModule\\images\\' + fname, "Url": "SBFrameWork/SandboxFrameworkPart/images/" + fname });
                }
                ));

});

//    <File ReplaceContent="TRUE" Path="CodeModule\bundle.css" Url="SBFrameWork/SandboxFrameworkPart/bundle.css"/>
