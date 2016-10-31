var gulp = require('gulp');

var less = require('gulp-less');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');
var header = require('gulp-header');

var pkg = require('./package.json');

var banner = ['/**',
	' * TREPL - <%= pkg.description %>',
	' * Version: v<%= pkg.version %>',
	' * Website: <%= pkg.homepage %>',
	' * Author: <%= pkg.author.name %> (<%= pkg.author.email %>)',
	' *',
	' * The MIT License (MIT)',
	' * Copyright(c) 2016 Tomasz Rewak ',
	' *',
	' * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and / or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject tothe following conditions:',
	' * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
	' * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
	' */',
	''].join('\n')

gulp.task('less', function () {
	return gulp.src('Source/stylesheets/**/*.less')
		.pipe(less())
		.pipe(gulp.dest('Site/public/stylesheets'));
});

gulp.task('typescript', function () {
	return gulp.src('Source/scripts/**/*.ts')
		.pipe(typescript({ target: 'ES6', removeComments: true, out: 'site.js' }))
		//.pipe(uglify()) // waiting for es6 support
		.pipe(header(banner, { pkg : pkg }))
		.pipe(gulp.dest('Site/public/javascripts/'));
});

gulp.task('watch', function () {
	gulp.watch('Source/scripts/**/*.ts', ['typescript']);
	gulp.watch('Source/stylesheets/**/*.less', ['less']);
});