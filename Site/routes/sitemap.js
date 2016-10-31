var express = require('express');
var db = require('../models/db.js');
var _ = require('underscore');
var router = express.Router();

function generateSitemap(urls) {
    var root_path = 'http://www.trepl.xyz/';
    var priority = 0.5;
    var freq = 'monthly';
    var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for (var i in urls) {
        xml += '<url>';
        xml += '<loc>'+ root_path + urls[i] + '</loc>';
        xml += '<changefreq>'+ freq +'</changefreq>';
        xml += '<priority>'+ priority +'</priority>';
        xml += '</url>';
        i++;
    }
    xml += '</urlset>';
    return xml;
}

router.get('/sitemap.xml', function(req, res) {
	db.getLessonsList(function(err, rows){
		if (err) {
			//res.render('404');
		}
		else {
    		var baseURLs = ['', 'ide'];

			var lessonsURLs = _.map(rows, function(lesson){
				return ("ide/" + lesson.Id + "/" + lesson.Name).replace(/\s+/g, '-').toLowerCase();
			});

			var sitemap = generateSitemap(baseURLs.concat(lessonsURLs));
		    res.header('Content-Type', 'text/xml');
		    res.send(sitemap); 
		}
	});
});

module.exports = router;