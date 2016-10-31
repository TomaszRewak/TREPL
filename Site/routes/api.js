var express = require('express');
var db = require('../models/db.js');
var router = express.Router();

router.route('/api/sections')
	.get(function(req, res) {
		db.getTopMostSections(function(err, rows){
			if (err)
                res.json([]);
            else
            	res.json(rows);
		});
	});

router.route('/api/sections/:sectionId')
	.get(function(req, res) {
		var response = {
			sections: [],
			lessons: []
		};

		var sectionId = req.params.sectionId;

		db.getLessonsForSectionID(sectionId, function(err, rows){
			if (!err)
				response.lessons = rows;

			db.getSubsectionsForSectionID(sectionId, function(err, rows){
				if (!err)
					response.sections = rows;
				
				res.json(response);
			});
		});
	});

router.route('/api/lessons/:lessonId')
	.get(function(req, res) {
		var lessonId = req.params.lessonId;

		db.getLessonForID(lessonId, function(err, rows){
			if (err)
				res.json({});
			else
				res.json(rows.length > 0 ? rows[0] : {});
		});
	});

module.exports = router;