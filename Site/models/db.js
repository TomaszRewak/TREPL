var _ = require('underscore');

var mysql = require('mysql');
var pool = mysql.createPool({
	host: process.env.TREPL_db_host,
	database: process.env.TREPL_db_database,
	user: process.env.TREPL_db_user,
	password: process.env.TREPL_db_password
});

module.exports.getTopMostSections = function (callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT Id, Name, Description FROM Sections WHERE Parent IS NULL ORDER BY No', function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getLessonsForSectionID = function (id, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT Id, Name, Description, Task FROM Lessons WHERE SectionId = ? ORDER BY No', [id], function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getSubsectionsForSectionID = function (id, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT Id, Name, Description FROM Sections WHERE Parent = ? ORDER BY No', [id], function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getLessonForID = function (id, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT Id, Name, Description, Task, Code, SectionId FROM Lessons WHERE Id = ? ORDER BY No', [id], function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getLessonsList = function (callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT Id, Name FROM Lessons', function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getAllLessons = function (callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT * FROM Lessons', function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.getSectionsHierachy = function (topSectionID, callback) {
	function getHierachySegment(connection, segmentId, prevSections, previousId) {
		segmentId = segmentId ? segmentId : null
		
		connection.query(
			segmentId ? 
			'(SELECT Id, Name, Description, 1 AS IsSection FROM Sections WHERE Parent = ? ORDER BY No) UNION ALL (SELECT Id, Name, Description, 0 AS IsSection FROM Lessons WHERE SectionId = ? ORDER BY No)' :
			'(SELECT Id, Name, Description, 1 AS IsSection FROM Sections WHERE Parent IS NULL ORDER BY No) UNION ALL (SELECT Id, Name, Description, 0 AS IsSection FROM Lessons WHERE SectionId IS NULL ORDER BY No)', 
			[segmentId, segmentId], 
			function (err, rows) {
				if (err) {
					connection.release();
					callback(err);
				}
				else {
					_.each(rows, function (e) {
						if (e.Id == previousId)
							e.Subsections = prevSections;
						else
							e.Subsections = [];
					});
					if (!segmentId) {
						connection.release();
						callback(err, rows);
					}
					else {
						connection.query('SELECT Parent FROM Sections WHERE Id = ?', [segmentId], function (err, parent) {
							if (err || !parent.length) {
								connection.release();
								callback(err);
							}
							else {
								var parentId = parent[0].Parent;
								
								getHierachySegment(connection, parentId, rows, segmentId);
							}
						});
					}
				}
			});
	}
	
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			getHierachySegment(connection, topSectionID, [])
		}
	});
}

module.exports.getAllSections = function (callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('SELECT * FROM Sections', function (err, rows) {
				connection.release();
				callback(err, rows);
			});
		}
	});
}

module.exports.updateLesson = function (id, data, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('UPDATE Lessons SET Name = ?, Description = ?, Code = ?, Task = ?, No = ?, SectionId = ? WHERE Id = ?', 
				[data.name, data.description, data.code, data.task, data.no, data.sectionId, id],
				function (err, rows) {
				connection.release();
				callback(err);
			});
		}
	});
}

module.exports.updateSection = function (id, data, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('UPDATE Sections SET Name = ?, Description = ?, No = ?, Parent = ? WHERE Id = ?', 
				[data.name, data.description, data.no, data.parent ? data.parent : null, id],
				function (err, rows) {
				connection.release();
				callback(err);
			});
		}
	});
}

module.exports.addLesson = function (data, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('INSERT INTO Lessons (Name, Description, Code, Task, No, SectionId) VALUES (?, ?, ?, ?, ?, ?)', 
				[data.name, data.description, data.code, data.task, data.no, data.sectionId],
				function (err, result) {
				connection.release();
				
				if (err)
					callback(err);
				else
					callback(null, result.insertId);
			});
		}
	});
}

module.exports.addScetion = function (data, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('INSERT INTO Sections (Name, Description, No, Parent) VALUES (?, ?, ?, ?)', 
				[data.name, data.description, data.no, data.parent ? data.parent : null],
				function (err, result) {
				connection.release();
				
				if (err)
					callback(err);
				else
					callback(null, result.insertId);
			});
		}
	});
}

module.exports.deleteLesson = function (id, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('DELETE FROM Lessons WHERE Id = ?', [id], function (err, rows) {
				connection.release();
				
				if (err)
					callback(err);
				else
					callback(null);
			});
		}
	});
}

module.exports.deleteSection = function (id, callback) {
	pool.getConnection(function (err, connection) {
		if (err)
			callback(err, []);
		else {
			connection.query('DELETE FROM Sections WHERE Id = ?', [id], function (err, rows) {
				connection.release();
				
				if (err)
					callback(err);
				else
					callback(null);
			});
		}
	});
}