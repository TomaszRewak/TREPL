var express = require('express');
var db = require('../models/db.js');
var _ = require('underscore');
var router = express.Router();

function restrict(source)
{
	source(['/admin', '/admin*', '/javascripts/admin*'], function (req, res, next) {
		if (req.user && req.user.isAdmin)
		{
			next();
		}
		else
		{
			res.render('404');
		}
	});
}

restrict(function(path, action){router.get(path, action)});
restrict(function(path, action){router.put(path, action)});
restrict(function(path, action){router.post(path, action)});
restrict(function(path, action){router.delete(path, action)});

router.get('/admin', function (req, res) {
	res.render('admin');
});

router.get('/admin/tutorials', function (req, res) {
	db.getAllLessons(function(err, lessonsList) {
		if (!err && lessonsList)
		{
			db.getAllSections(function(err, sectionsList) {
				if (!err && sectionsList)
				{
					var lessons = {};
					var sections = {};

					for (var lesson in lessonsList)
						lessons[lessonsList[lesson].Id] = lessonsList[lesson];

					for (var section in sectionsList)
						sections[sectionsList[section].Id] = sectionsList[section];

					for (var section in sections) {
						sections[section].subSections = [];
						sections[section].lessons = [];
					}

					for (var lesson in lessons)
					{
						sections[lessons[lesson].SectionId].lessons.push(lessons[lesson]);
					}

					for (var section in sections)
					{
						if (sections[section].Parent != null)
							sections[sections[section].Parent].subSections.push(sections[section]);
					}

					var topMostSections = [];

					for (var section in sections)
					{
						if (sections[section].Parent == null)
						{
							topMostSections.push(sections[section]);
						}
					}

					var comparator = function(a, b) {
						if (a.No < b.No)
							return -1;
						else if (a.No > b.No)
							return 1;
						else
							return 0;
					}

					for (var section in sections)
					{
						sections[section].subSections.sort(comparator);
						sections[section].lessons.sort(comparator);
					}

					topMostSections.sort(comparator);

					res.render('adminTutorials', {tutorials : topMostSections});
				}
			});
		}
	});
});

router.put('/admin/tutorials/lessons/:lessonId', function(req, res) {
	var lessonId = req.params.lessonId;
	var lessonData = req.body;

	db.updateLesson(lessonId, lessonData, function(err) {
		res.json({
			success : !err
		});
	});
});

router.put('/admin/tutorials/sections/:sectionID', function(req, res) {
	var sectionID = req.params.sectionID;
	var sectionData = req.body;

	db.updateSection(sectionID, sectionData, function(err) {
		res.json({
			success : !err
		});
	});
});

router.post('/admin/tutorials/lessons', function(req, res) {
	var lessonData = req.body;

	db.addLesson(lessonData, function(err, newId) {
		res.json({
			success : !err,
			id: newId
		});
	});
});

router.post('/admin/tutorials/sections', function(req, res) {
	var sectionData = req.body;

	db.addScetion(sectionData, function(err, newId) {
		res.json({
			success : !err,
			id: newId
		});
	});
});

router.delete('/admin/tutorials/lessons/:lessonId', function(req, res) {
	var lessonId = req.params.lessonId;

	db.deleteLesson(lessonId, function(err) {
		res.json({
			success : !err
		});
	});
});

router.delete('/admin/tutorials/sections/:sectionId', function(req, res) {
	var sectionId = req.params.sectionId;

	db.deleteSection(sectionId, function(err) {
		res.json({
			success : !err
		});
	});
});

module.exports = router;