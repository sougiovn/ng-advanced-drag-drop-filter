(function Demo() {
  
  'use strict';
  
  angular.module('demo', ['nggs.advanced-drag-drop-filter'])
    .config(config)
    .controller('demoController', controller);
  
  config.$inject = ['ngAdvancedDragDropFilterConfigProvider']
  
  function config(ngAdvancedDragDropFilterConfigProvider) {
    ngAdvancedDragDropFilterConfigProvider.setDefaults({
      texts: {
        setDefaultButtonText: 'Definir como padrão'
      },
      styleClasses: {
        setDefaultButtonClass: 'btn btn-primary',
        newButtonClass: 'btn btn-secondary',
        editButtonClass: 'btn btn-secondary',
        saveButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger'
      },
      iconPrefix: 'fa'
    });
  }
  
  function controller() {
    var self = this;
    
    self.nomeFilter = '';
    
    self.filters = [
      {
        id: 1,
        name: 'Filtro 1',
        fields: ['input', 'select']
      },
      {
        id: 2,
        name: 'Filtro 2',
        fields: ['range', 'datepicker']
      }
    ];
    
    self.defaultFilter = self.filters[0];
    
    self.onSave = function(savedFilter) {
      console.log('salvou', savedFilter);
      if (savedFilter.id) {
        var filter = self.filters.find(function(f) {
          return f.id === savedFilter.id;
        });
        
        filter.name = savedFilter.name;
        filter.fields = savedFilter.fields;
      } else {
        savedFilter.id = self.filters.length + 1;
        self.filters.push(savedFilter);
      }
    };
  
    self.onChange = function(filter) {
      console.log('mudou para', filter)
    };
  
    self.onSetDefault = function(filter) {
      console.log('set default', filter);
      self.defaultFilter = filter;
    }
  }
  
})();
