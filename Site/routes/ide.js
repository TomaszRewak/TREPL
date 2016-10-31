var express = require('express');
var db = require('../models/db.js');
var router = express.Router();
var passport = require('../config/authentication.js').passport;
var firstLesson = require('./basic/first lesson.json');

function renderIDEforCode(res, id, name, description) {
	db.getLessonForID(id, function (err, rows) {
		if (err || rows.length == 0)
			res.render('404');
		else {
			var lesson = rows[0];
			
			if (name && description) {
				res.render('ide', {
					name: name, 
					description: description,
					lesson: { Code: firstLesson },
					navigationTree: null
				});
			}
			else {
				db.getSectionsHierachy(lesson.SectionId, function (err, navigationTree) {
					res.render('ide', {
						name: lesson.Name, 
						description: lesson.Task,
						lesson: lesson,
						navigationTree: navigationTree
					});
				});
			}
		}
	});
}

/* GET ide page. */
router.get(['/ide', '/ide.html'], function (req, res) {
	res.render('ide', {
		name: "IDE", 
		description: "Create an algorithm or a data structure (or pick a ready one) and see how computer's memory changes during its execution.",
		lesson: { Code: JSON.stringify(firstLesson) },
		navigationTree: null
	});
});

router.route('/ide/:lessonId/:lessonName').get(function (req, res) {
	var lessonId = req.params.lessonId;
	renderIDEforCode(res, lessonId);
});

module.exports = router;