Cards = new Meteor.Collection('card');
Drags = new Meteor.Collection('drag');

if (Meteor.is_client) {
	Template.board.events = {
		'click #addTask' : function(event) {
			var _task = $('#nameTask').val();
			Cards.insert({task : _task, state: "todo", priority: 1, color: Math.floor(Math.random()*10)});
			$('#nameTask').val('');
		},
		'mouseover .drag': function(event) {
			if (!$(event.target).data('draggable')) {
				$(event.target).draggable({
					drag: function (event, ui) {
						var position = ui.position;
						Drags.update({_id: ui.helper.attr('id')}, {$set: {left:position.left, top:position.top}});
					}
				});
			}
		}
	};
	
	Template.board.drags = function () {
		return Drags.find();
	}
	
	Template.todo.taskList = function () {
		return Cards.find({state: "todo"}, {sort: {priority: 1}});
	}
	
	Template.doing.taskList = function () {
		return Cards.find({state: "doing"}, {sort: {priority: 1}});
	}
	
	Template.done.taskList = function () {
		return Cards.find({state: "done"}, {sort: {priority: 1}});
	}
	
	Meteor.startup(function(){
		$('#nameTask').focus();
		
		var list = ["#todos", "#doings", "#dones"];
		
		function connectWith(currentState) {
			var newList = $.map(list, function(state, index) {
				if (state != currentState) {
					return state;
				}
			});
			return newList.join();
		};
		
		for (var i = 0; i < list.length; i++) {
			var currentState = list[i];
			
			var optionsSortable = {
				placeholder: '.card',
				connectWith: connectWith(currentState),
				//eventos disparados pelo componente de sortable.
				update: function (event, ui) {
					var $this = $(this),
					    results = $(this).sortable('toArray'),
							_id = $this.attr('id'),
							_state = _id.substring(0,_id.length-1) ;
		
	        for (var i = 0; i < results.length; i++) {
						Cards.update({_id: results[i]}, {$set: {priority: i + 1, state: _state}});
					} 
				},
				stop: function (event, ui) {
					var _div_parent = ui.item.parent(),
              _id = _div_parent.attr("id"),
							//Remove o 's' dos ids para buscar as tarefas
							//Ex: #todos => todo	
              _state = _id.substring(0,_id.length-1);	
		
            //delete the copy created by sortable plugin.
            $("#"+_id).find("div[data-state!="+_state+"]").remove();
				}
			};

			$(currentState).sortable(optionsSortable);
		}
		
	});
}