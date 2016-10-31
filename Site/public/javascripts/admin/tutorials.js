function controlFor(control, className, value)
{
	return $('<'+control+'></'+control+'>').addClass(className).val(value);
}

function inputFor(className, value, enabled)
{
	var input = controlFor('input', className, value).attr('type', 'text');

	if (!enabled)
		input.attr('disabled', 'disabled');

	return input;
}

function textAreaFor(className, value)
{
	return controlFor('textarea', className, value);
}

function submitButton() {
	return $('<button></button>').addClass('submitButton').text('save').attr('disabled', 'disabled');
}

function deleteButton() {
	return $('<button></button>').addClass('deleteButton').text('delete');
}

function addButton() {
	return $('<button></button>').addClass('addButton').text('add');
}

function upToDate(record) {
	record.children('.recordData').children('.submitButton').attr('disabled', 'disabled');
	record.removeClass('editedRecord');
}

function outOfDate(record) {
	record.children('.recordData').children('.submitButton').removeAttr('disabled');
	record.addClass('editedRecord');
}

function deleteRecord(record) {
	record.detach();
}

function lessonForData(lesson)
{
	var record = $('<div></div>').addClass('section').addClass('record');
	var recordData = $('<div></div>').addClass('recordData');

	var inputEvent = function() {
		outOfDate(record);
	}

	var inputId = inputFor('id', lesson.Id, false);
	var inputName = inputFor('lessonName', lesson.Name, true).on('input', inputEvent);
	var inputDescription = textAreaFor('lessonDescription', lesson.Description).on('input', inputEvent);
	var inputTask = textAreaFor('lessonTask', lesson.Task).on('input', inputEvent);
	var inputCode = textAreaFor('lessonCode', lesson.Code).on('input', inputEvent);
	var inputParent = inputFor('parent', lesson.SectionId, false);
	var inputOrder = inputFor('order', lesson.No, false);

	recordData.append(inputId);
	recordData.append(inputName);
	recordData.append(inputDescription);	
	recordData.append(inputTask);
	recordData.append(inputCode);
	recordData.append(inputParent);
	recordData.append(inputOrder);

	recordData.append(submitButton().click(function(){
		$.ajax({
			url: '/admin/tutorials/lessons/' + lesson.Id,
			type: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify({
				name: inputName.val(),
				description: inputDescription.val(),
				task: inputTask.val(),
				code: inputCode.val(),
				sectionId: inputParent.val(),
				no: inputOrder.val()
			}),
			success: function(data) {
				upToDate(record);
			}
		});
	}));
	recordData.append(deleteButton().click(function(){
		$.ajax({
			url: '/admin/tutorials/lessons/' + lesson.Id,
			type: 'DELETE',
			success: function(data) {
				if (data.success) {
					deleteRecord(record);
				}
			}
		});
	}));

	record.append(recordData);

	return record;
}

function addLesson(lesson, holder)
{
	var record = lessonForData(lesson);

	holder.append(record);
}

function reordered(sortable) {
	var children = sortable.children();

	for (var i in children)
	{
		var child = children.eq(i);

		var newNo = parseInt(i) + 1;
		var No = child.children('.recordData').children('.order');

		if (No.val() != newNo)
		{
			No.val(newNo);
			outOfDate(child);
		}
	}
}

function reorder(event, ui)
{
	reordered(ui.item.parent());
	reordered($(ui.sender));

	ui.item.children('.recordData').children('.parent').val(ui.item.parent().closest('.record').children('.recordData').children('.id').val());

	outOfDate(ui.item);
}

function sectionForData(section, topMostSection)
{

	var record = $('<div></div>').addClass('section').addClass('record');

	if (!topMostSection)
	{
		var recordData = $('<div></div>').addClass('recordData');

		var inputEvent = function() {
			outOfDate(record);
		}

		var inputId = inputFor('id', section.Id, false);
		var inputName = inputFor('sectionName', section.Name, true).on('input', inputEvent);
		var inputDescription = textAreaFor('sectionDescription', section.Description).on('input', inputEvent);
		var inputParent = inputFor('parent', section.Parent, false);
		var inputOrder = inputFor('order', section.No, false);

		recordData.append(inputId);
		recordData.append(inputName);
		recordData.append(inputDescription);
		recordData.append(inputParent);
		recordData.append(inputOrder);
		recordData.append(submitButton().click(function(){
			$.ajax({
				url: '/admin/tutorials/sections/' + inputId.val(),
				type: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify({
					name: inputName.val(),
					description: inputDescription.val(),
					parent: inputParent.val(),
					no: inputOrder.val()
				}),
				success: function(data) {
					upToDate(record);
				}
			});
		}));
		recordData.append(deleteButton().click(function(){
			$.ajax({
				url: '/admin/tutorials/sections/' + section.Id,
				type: 'DELETE',
				success: function(data) {
					if (data.success) {
						deleteRecord(record);
					}
				}
			});
		}));

		record.append(recordData);

		// lessons

		var lessons = $('<div></div>').addClass('lessons').sortable({
			connectWith: '.lessons',
			update: reorder
		});

		for(var i in section.lessons)
		{
			var lesson = section.lessons[i];
			addLesson(lesson, lessons)
		}

		record.append($('<div></div>').text('Lessons: ').addClass('recordHeader'));
		record.append(lessons);
		record.append(addButton().click(function() {
			$.ajax({
				url: '/admin/tutorials/lessons',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					name: 'Comming soon',
					description: 'Comming soon',
					task: '',
					code: '',
					sectionId: section.Id,
					no: 99999
				}),
				success: function(data) {
					if (data.success) {
						addLesson({ Id: data.id, SectionId: section.Id }, lessons);
						reordered(lessons);
					}
				}
			});
		}));
	}

	// sections

	var sections = $('<div></div>').addClass('sections').sortable({
		connectWith: '.sections',
		update: reorder
	});

	for(var i in section.subSections)
	{
		var subsection = section.subSections[i];
		addSection(subsection, sections)
	}

	record.append($('<div></div>').text('Sections: ').addClass('recordHeader'));
	record.append(sections);
	record.append(addButton().click(function() {
		$.ajax({
			url: '/admin/tutorials/sections',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				name: 'Comming soon',
				description: 'Comming soon',
				parent: section.Id,
				no: 99999
			}),
			success: function(data) {
				if (data.success) {
					addSection({ Id: data.id, Parent: section.Id }, sections);
					reordered(sections);
				}
			}
		});
	}));

	if (!topMostSection)
	{
		var visible = true;

		record.dblclick(function(event) {
			if (visible)
				recordData.nextAll().hide();
			else
				recordData.nextAll().show();

			visible = !visible;

			event.stopPropagation();
		});

		record.dblclick();
	}

	return record;
}

function addSection(section, holder, topMostSection)
{
	var record = sectionForData(section, topMostSection);

	holder.append(record);
}

$(function() {
	var tutorials = window.tutorials;
	var holder = $('#sectionsHolder');

	var examples = $('#exampleHolder');

	var exampleLesson = {
		Id : 'Id',
		Name : 'Lesson name',
		Description: 'Description',
		Task: 'Task to do',
		Code: 'Code of the lesson',
		SectionId: 'Section',
		No: 'Order'
	};

	var exampleSection = {
		Id : 'Id',
		Name : 'Section name',
		Description: 'Description',	
		Parent: 'Section',
		No: 'Order'
	};

	var topMostSection = {
		Id : null,
		subSections : tutorials,
		lessons : []
	}

	addSection(topMostSection, holder, true);

	examples.append($('<div>Lesson: </div>'));
	examples.append(lessonForData(exampleLesson));
	examples.append($('<div>Section: </div>'));
	examples.append(sectionForData(exampleSection));

	$('#saveAll').click(function() {
		$('.editedRecord').children('.recordData').children('.submitButton').click();
	});


});