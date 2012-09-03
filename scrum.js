//Coleção das tarefas.
Cards = new Meteor.Collection('card');

if (Meteor.is_client) {
  /**
  * Cria a função para adicionar novas tarefas
  * quando o botão "#addTask" for acionado.
  *
  * @TODO Adicinar validações.
  */
  Template.board.events = {
    'click #addTask' : function(event) {
      var _task = $('#nameTask').val();
      Cards.insert({task : _task, state: "todo", priority: 1, color: Math.floor(Math.random()*10)});
      $('#nameTask').val('');
    }
  };
  /**
  * Função é chamada toda vez que o kanbam é renderizado.
  * Ele adiciona aos elementos '.card' a função de draggable.
  *
  * @TODO O left e top gravado é de acordo com a resolução (window) do 
  * usuário que está realizando a ação, mas o layout é fluido, sendo assim
  * pensar em uma solução que atenda todas as resoluções de forma igual e coerente.
  */
  Template.task.applyDragElements = function () {
    Meteor.defer( function() {
      $('.card').draggable({
        revert: 'invalid',
        drag: function (event, ui) {
          var position = ui.position,
          nameUser = $('#nameUser').val() || 'Anônimo';
          //Toda vez que o usuário move uma tarefa o "top" e "left"
          //é compartilhado entre todos na aplicação. Este dado é persistido no banco.
          Cards.update({_id: ui.helper.attr('id')}, {$set: {left:position.left, top:position.top, blocked:'lock', user: nameUser}});
        }
      });
    });
  };
  /**
  * Retorna as tarefas com o estado "todo".
  */
  Template.todo.taskList = function () {
    return Cards.find({state: "todo"}, {sort: {priority: 1}});
  }
  /**
  * Retorna as tarefas com o estado "doing".
  */
  Template.doing.taskList = function () {
    return Cards.find({state: "doing"}, {sort: {priority: 1}});
  }
  /**
  * Retorna as tarefas com o estado "done".
  */
  Template.done.taskList = function () {
    return Cards.find({state: "done"}, {sort: {priority: 1}});
  }
  /**
  * Função chamada assim que a aplicação é iniciada.
  * Transforma as div's que representam as fazes em droppable.
  */
  Meteor.startup(function(){
    $('#nameUser').focus();
    //Lista dos ids das fases do kambam.
    var boxes = ["#todos", "#doings", "#dones"];
    $(boxes.join(',')).droppable({
      activeClass: "state-hover",
      hoverClass: "state-active",
      drop: function( event, ui ) {
        var $this = $(this),
        idState = $this.attr('id').substring(0, $this.attr('id').length - 1);

        ui.draggable.appendTo(this);
        Cards.update({_id: ui.draggable.attr('id')}, {$set: {state: idState, left:0, top:0, blocked:'unlock', user:''}});
        //Evitar erros de duplicidade de elementos.
        ui.draggable.remove();
      }
    })
  });
}