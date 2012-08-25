Cards = new Meteor.Collection('card');
Drags = new Meteor.Collection('drag');

if (Meteor.is_client) {
  Template.board.events = {
    'click #addTask' : function(event) {
      var _task = $('#nameTask').val();
      Cards.insert({task : _task, state: "todo", priority: 1, color: Math.floor(Math.random()*10)});
      $('#nameTask').val('');
    }
  };

  Template.task.applyDragElements = function () {
    Meteor.defer( function() {
      $('.card').draggable({
        revert: 'invalid',
        drag: function (event, ui) {
          var position = ui.position,
          nameUser = $('#nameUser').val() || 'Anônimo';
          Cards.update({_id: ui.helper.attr('id')}, {$set: {left:position.left, top:position.top, blocked:'lock', user: nameUser}});
        }
      });
    });
  };

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
    $('#nameUser').focus();
    var boxes = ["#todos", "#doings", "#dones"];
    $(boxes.join(',')).droppable({
      activeClass: "state-hover",
      hoverClass: "state-active",
      drop: function( event, ui ) {
        var $this = $(this),
        idState = $this.attr('id').substring(0, $this.attr('id').length - 1);
        ui.draggable.appendTo(this);
        Cards.update({_id: ui.draggable.attr('id')}, {$set: {state: idState, left:0, top:0, blocked:'unlock', user:''}});
        //Evitar erros de duplicidade.
        ui.draggable.remove();
      }
    })
  });
}