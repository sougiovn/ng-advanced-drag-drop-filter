(function Demo() {
  
  'use strict';
  
  angular.module('demo', ['nggs.advanced-drag-drop-filter'])
    .config(config)
    .controller('demoController', controller);
  
  config.$inject = ['ngAdvancedDragDropFilterConfigProvider']
  
  function config(ngAdvancedDragDropFilterConfigProvider) {
    ngAdvancedDragDropFilterConfigProvider.setDefaults({
      texts: {
        filterSelectionLabelText: 'Available filters',
        setDefaultButtonText: 'Make default',
        editButtonText: 'Edit filter',
        newButtonText: 'New filter',
        cancelButtonText: 'Cancel form',
        saveButtonText: 'Save form',
        selectedFilterLabelText: 'Selected filter\'s name: ',
        availableContainerLabelText: 'Available fields for selection',
        selectedEmptyMessageText: 'Select or create a new filter configuration, it\'s simple!'
      },
      styleClasses: {
        setDefaultButtonClass: 'btn btn-secondary',
        newButtonClass: 'btn btn-primary',
        editButtonClass: 'btn btn-info',
        saveButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        selectedEmptyMessageClass: 'alert alert-warning'
      },
      iconPrefix: 'fa'
    });
  }
  
  function controller() {
    var self = this;
    
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
    
    self.selected = self.filters[0];
    
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
    }
  }
  
})();
