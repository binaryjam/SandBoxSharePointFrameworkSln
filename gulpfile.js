var gulp = require("gulp");
var debug = require("gulp-debug");
var concat = require('gulp-concat');
var gulpfn = require("gulp-fn");
var xeditor = require("gulp-xml-editor");
var prettyData = require('gulp-pretty-data');
var clean = require('gulp-clean');
var rename = require("gulp-rename");
var destination = "";

//Lol, gulp works our the dependancy tree and executes everything you need
gulp.task('build', ['packagesp']);


gulp.task('cleanlocal', function () {
        return gulp.src('./WebComponents/buildlocal/**', { read: false })
                .pipe(clean());
});

gulp.task('cleansp',['cleansp1','cleansp2']);
gulp.task('cleansp1', function () {
        return gulp.src('./WebComponents/buildSP/**', { read: false })
                .pipe(clean());
});
gulp.task('cleansp2',['cleansp1'], function () {
        return gulp.src('./SandBoxSharePointFramework/CodeModule/**/*.{jpg,png,css,js,htm,html}', { read: false })
                .pipe(clean());
});

gulp.task('buildhtmllocal', ['cleanlocal'], function () {
        return gulp.src(['./WebComponents/.container/localtop.htm',
                './WebComponents/.container/loader.htm',
                './WebComponents/src/webpartcontent.htm',
                './WebComponents/.container/localbottom.htm'])
                .pipe(concat('index.html'))
                .pipe(gulp.dest('./WebComponents/buildlocal'));
});

gulp.task('buildcssboth', ['cleanlocal', 'cleansp'], function () {
        return gulp.src(['./WebComponents/src/css/*.css'])
                .pipe(debug({
                        title: 'cssbuild:'
                }))
                .pipe(concat('bundle.css'))
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildjsboth', ['cleanlocal', 'cleansp'], function () {
        return gulp.src(['./WebComponents/src/js/*.js'])
                .pipe(concat('bundle.js'))
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildimgboth', ['cleanlocal', 'cleansp'], function () {
        return gulp.src(['./WebComponents/src/images/*.*'])
                .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart/images'))
                .pipe(gulp.dest('./WebComponents/buildSP/images'));

});

gulp.task('buildhtmlsp', ['cleansp'], function () {
        return gulp.src(['./WebComponents/.container/loader.htm', './WebComponents/src/webpartcontent.htm'])
                .pipe(concat('loader.htm'))
                .pipe(gulp.dest('./WebComponents/buildSP'));
});

var elementFiles = [];

gulp.task('packagesp', ['prettify1','prettify2']);

gulp.task('packageXmlFiles', ['buildhtmlsp', 'buildjsboth', 'buildcssboth'], function () {

        return gulp.src(['./WebComponents/buildSP/*.*'])
                .pipe(gulp.dest('./SandBoxSharePointFramework/CodeModule'))
                .pipe(gulpfn(function (file) {
                        var fname = file.path.substring(file.base.length + 1);
                        elementFiles.push({ "name": fname, srcprefix:"", path: 'CodeModule\\' + fname, "Url": "SBFrameWork/SandboxFrameworkPart/" + fname });
                }
                ));
});

gulp.task('packageImages', ['buildimgboth'], function () {
        return gulp.src(['./WebComponents/buildSP/images/*.*'])
                .pipe(gulp.dest('./SandBoxSharePointFramework/CodeModule/images'))
                .pipe(gulpfn(function (file) {
                        var fname = file.path.substring(file.base.length + 1);
                        elementFiles.push({ "name": fname, srcprefix:'images/', path: 'CodeModule\\images\\' + fname, "Url": "SBFrameWork/SandboxFrameworkPart/images/" + fname });
                }
                ));

});

gulp.task('packageElements', ['packageXmlFiles', 'packageImages'], function () {
        return gulp.src("./SandBoxSharePointFramework/CodeModule/Elements.xml")
                .pipe(xeditor(function (xml, xmljs) {
                        var node = xml.find('//xmlns:File', 'http://schemas.microsoft.com/sharepoint/');
                        for (var i = 0; i < node.length; i++) {
                                node[i].remove();
                        }
                        var module = xml.get('//xmlns:Module', 'http://schemas.microsoft.com/sharepoint/');
                        for (var j = 0; j < elementFiles.length; j++) {
                                module.node('File')
                                        .attr({ ReplaceContent: 'TRUE' })
                                        .attr({ Path: elementFiles[j].path })
                                        .attr({ Url: elementFiles[j].Url });
                        }


                        return xml;
                }))
                .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

gulp.task('prettify1', ['packageElements'], function () {
        return gulp.src("./SandBoxSharePointFramework/CodeModule/Elements.xml")
                .pipe(prettyData({ type: 'prettify' }))
                .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

gulp.task('packagespdata',  ['packageXmlFiles', 'packageImages'], function () {
        //Clear out all the File objects in the XML
        return gulp.src("./SandBoxSharePointFramework/CodeModule/SharePointProjectItem.spdata")
                .pipe(xeditor(function (xml, xmljs) {
                        var node = xml.find('//xmlns:ProjectItemFile[@Type="ElementFile"]', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
                        for (var i = 0; i < node.length; i++) {
                                node[i].remove();
                        }
                        var module = xml.get('//xmlns:Files', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
                        for (var j = 0; j < elementFiles.length; j++) {
                                module.node('ProjectItemFile')
                                        .attr({ "Source": elementFiles[j].srcprefix + elementFiles[j].name })
                                        .attr({ "Target":  elementFiles[j].path })
                                        .attr({ "Type": "ElementFile" });
                        }


                        return xml;
                }))
                .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

gulp.task('prettify2', ['packagespdata'], function () {
        return gulp.src("./SandBoxSharePointFramework/CodeModule/SharePointProjectItem.spdata")
                .pipe(rename("SharePointProjectItem.spdata.xml"))
                .pipe(prettyData({ type: 'prettify' }))
                .pipe(rename("SharePointProjectItem.spdata"))
                .pipe(gulp.dest("./SandBoxSharePointFramework/CodeModule/", { "overwrite": true }));
});

//    <File ReplaceContent="TRUE" Path="CodeModule\bundle.css" Url="SBFrameWork/SandboxFrameworkPart/bundle.css"/>
