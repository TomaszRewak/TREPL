var _ = require('underscore');

//p1341_trepl
//WDVPqpqgcLVkRJ0CfO2q

var dbConfig = {
    userName: 'trepl@tr.database.windows.net',
    password: 'PestkiWisce7',
    server: 'tr.database.windows.net', 
    options: {
        database: 'Shared Database',
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
}
var DBConnection = require('tedious').Connection;
var DBRequest = require('tedious').Request;
var TYPES = require('tedious').TYPES;

function connect(callback) {
    var dbConnection = new DBConnection(dbConfig);
    dbConnection.on('connect', function (err) {
        callback(err, dbConnection);
    });
}

function mapResponse(columns) {
    var obj = {};
    _.each(columns, function(column) {
        obj[column.metadata.colName] = column.value;
    });
    return obj;
}
function mapResponsesList(rows) {
    return _.map(rows, function(row){
        return mapResponse(row);
    });
}

module.exports.getTopMostSections = function (callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT Id, Name, Description FROM Sections WHERE Parent IS NULL ORDER BY No", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            connection.execSql(dbRequest);            
        }      
    });
}

module.exports.getLessonsForSectionID = function (id, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT Id, Name, Description, Task FROM Lessons WHERE SectionId = @sectionId ORDER BY No", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            dbRequest.addParameter('sectionId', TYPES.Int, id);
            connection.execSql(dbRequest);            
        }      
    });  
}

module.exports.getSubsectionsForSectionID = function (id, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT Id, Name, Description FROM Sections WHERE Parent = @sectionId ORDER BY No", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            dbRequest.addParameter('sectionId', TYPES.Int, id);
            connection.execSql(dbRequest);            
        }      
    }); 
}

module.exports.getLessonForID = function (id, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT Id, Name, Description, Task, Code, SectionId FROM Lessons WHERE Id = @lessonId ORDER BY No", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            dbRequest.addParameter('lessonId', TYPES.Int, id);
            connection.execSql(dbRequest);             
        }      
    });   
}

module.exports.getLessonsList = function (callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT Id, Name FROM Lessons", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            connection.execSql(dbRequest);             
        }      
    });     
}

module.exports.getAllLessons = function (callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT * FROM Lessons", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            connection.execSql(dbRequest);             
        }      
    }); 
}

module.exports.getSectionsHierachy = function (topSectionID, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest(
                "WITH SectionsHierarchy(Id, Parent) " +
                "AS " +
                "( " +
                "   SELECT Id, Parent " +
                "   FROM Sections s " +
                "   WHERE s.Id = @sectionId " +
                "   UNION ALL " +
                "   SELECT p.Id, p.Parent " +
                "   FROM Sections p " +
                "   JOIN SectionsHierarchy h ON p.Id = h.Parent " +
                ") " +
                "SELECT s.Id, s.Name, s.Description, s.Parent AS Parent, 1 AS IsSection, No " +
                "FROM SectionsHierarchy sh " +
                "INNER JOIN Sections s ON (s.Parent = sh.Parent OR s.Parent IS NULL AND sh.Parent IS NULL) " +
                "UNION ALL " +
                "SELECT l.Id, l.Name, l.Description, l.SectionId AS Parent, 0 AS IsSection, No " + 
                "FROM SectionsHierarchy lh " +
                "INNER JOIN Lessons l ON l.SectionId = lh.Id " +
                "ORDER BY No ",
                function (err, rowCount, rows) {
                    connection.close();

                    var sectionsList = mapResponsesList(rows);

                    var topSections = [];
                    if (!err) {
                        var sections = {};
                        for(var i = 0; i < sectionsList.length; i++) {
                            var section = sectionsList[i];
                            sections[section.Id] = section;
                            section.Subsections = [];
                        }
                        for (var i = 0; i < sectionsList.length; i++) {
                            var section = sectionsList[i];
                            if (section.Parent)
                                sections[section.Parent].Subsections.push(section);
                            else
                                topSections.push(section);
                        }
                    }
                    else console.dir(err);

                    callback(err, topSections);
                });

            dbRequest.addParameter('sectionId', TYPES.Int, topSectionID);
            connection.execSql(dbRequest);   
        }
    });
}

module.exports.getAllSections = function (callback) {
    connect(function(err, connection) {
        if (err)
            callback(err, []);
        else {
            dbRequest = new DBRequest("SELECT * FROM Sections", function (err, rowCount, rows) {
                connection.close();
                callback(err, mapResponsesList(rows));
            });
            connection.execSql(dbRequest);             
        }      
    }); 
}

module.exports.updateLesson = function (id, data, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("UPDATE Lessons SET Name = @name, Description = @description, Code = @code, Task = @task, No = @no, SectionId = @sectionId WHERE Id = @id", function (err, rowCount, rows) {
                connection.close();
                callback(err);
            });

            dbRequest.addParameter('name', TYPES.Text, data.name);
            dbRequest.addParameter('description', TYPES.Text, data.description);
            dbRequest.addParameter('code', TYPES.Text, data.code);
            dbRequest.addParameter('task', TYPES.Text, data.task);

            dbRequest.addParameter('no', TYPES.Int, data.no);
            dbRequest.addParameter('sectionId', TYPES.Int, data.sectionId);

            dbRequest.addParameter('id', TYPES.Int, id);

            connection.execSql(dbRequest);
        }
    });
}

module.exports.updateSection = function (id, data, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("UPDATE Sections SET Name = @name, Description = @description, No = @no, Parent = @parent WHERE Id = @id", function (err, rowCount, rows) {
                connection.close();
                callback(err);
            });

            dbRequest.addParameter('name', TYPES.Text, data.name);
            dbRequest.addParameter('description', TYPES.Text, data.description);

            dbRequest.addParameter('no', TYPES.Int, data.no);
            dbRequest.addParameter('parent', TYPES.Int, data.parent ? data.parent : null);

            dbRequest.addParameter('id', TYPES.Int, id);

            connection.execSql(dbRequest);
        }
    });
}

module.exports.addLesson = function (data, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("INSERT INTO Lessons (Name, Description, Code, Task, No, SectionId) VALUES (@name, @description, @code, @task, @no, @sectionId); select @@identity", function (err, rowCount, rows) {
                connection.close();

                if (err)
                    callback(err);
                else
                    callback(null, rows[0][0].value);
            });

            dbRequest.addParameter('name', TYPES.Text, data.name);
            dbRequest.addParameter('description', TYPES.Text, data.description);
            dbRequest.addParameter('code', TYPES.Text, data.code);
            dbRequest.addParameter('task', TYPES.Text, data.task);

            dbRequest.addParameter('no', TYPES.Int, data.no);
            dbRequest.addParameter('sectionId', TYPES.Int, data.sectionId);

            connection.execSql(dbRequest);
        }
    });
}

module.exports.addScetion = function (data, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("INSERT INTO Sections (Name, Description, No, Parent) VALUES (@name, @description, @no, @parent); select @@identity", function (err, rowCount, rows) {
                connection.close();

                if (err)
                    callback(err);
                else
                    callback(null, rows[0][0].value);
            });

            dbRequest.addParameter('name', TYPES.Text, data.name);
            dbRequest.addParameter('description', TYPES.Text, data.description);

            dbRequest.addParameter('no', TYPES.Int, data.no);
            dbRequest.addParameter('parent', TYPES.Int, data.parent ? data.parent : null);

            connection.execSql(dbRequest);
        }
    });
}

module.exports.deleteLesson = function (id, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("DELETE FROM Lessons WHERE Id = @id", function (err, rowCount, rows) {
                connection.close();

                if (err)
                    callback(err);
                else
                    callback(null);
            });

            dbRequest.addParameter('id', TYPES.Int, id);

            connection.execSql(dbRequest);
        }
    });
}

module.exports.deleteSection = function (id, callback) {
    connect(function(err, connection) {
        if (err)
            callback(err);
        else {
            dbRequest = new DBRequest("DELETE FROM Sections WHERE Id = @id", function (err, rowCount, rows) {
                connection.close();

                if (err)
                    callback(err);
                else
                    callback(null);
            });

            dbRequest.addParameter('id', TYPES.Int, id);

            connection.execSql(dbRequest);
        }
    });
}