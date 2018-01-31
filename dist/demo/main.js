(function Demo() {
  
  'use strict';
  
  angular.module('demo', ['nggs.advanced-drag-drop-filter'])
    .controller('demoController', controller);
  
  function controller() {
    var self = this;
    
    self.nomeFilter = '';
    
    self.filters = [
      {
        id: 1,
        name: 'Filtro 1',
        fields: ['input1', 'input2']
      },
      {
        id: 2,
        name: 'Filtro 2',
        fields: ['input2', 'input4']
      }
    ];
    
    self.defaultFilter = self.filters[0];
  }
  
})();

//
// const target = document.querySelector('.target-container');
// const source = document.querySelector('.source-container');
// const items = document.querySelectorAll('.item');
//
// let dragged;
//
// document.addEventListener('dragstart', event => dragged = event.target, false);
//
// // document.addEventListener('dragend', event => console.log('dragend', event), false);
//
// document.addEventListener('dragover', event => event.preventDefault(), false);
//
// document.addEventListener('drop', event => {
//   event.preventDefault();
//   if (/target-container/.test(event.target.className)) {
//     dragged.parentNode.removeChild(dragged);
//     target.appendChild(dragged);
//   }
// }, false);