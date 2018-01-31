(function NgAdvancedDragDropFilter() {
  
  'use strict';
  
  angular.module('nggs.advanced-drag-drop-filter', [])
    .run(run)
    .directive('ngAdvancedDragDropFilter', directive);
  
  run.$inject = ['$templateCache'];
  
  function run($templateCache) {
    $templateCache.put(
      'nggs.advanced-drag-drop-filter.html',
      [
        '<div class="advanced-drag-drop-filter">',
          '<div class="control-container">',
            '<div class="filter-selection">',
              '<label>Filter:</label>',
              '<select ng-disabled="isEditing" ng-model="selectedFilter" ng-options="option.name for option in filters track by option.id" ng-change="change()"></select>',
            '</div>',
            '<div class="buttons-container">',
              '<button ng-if="!isEditing" type="button" ng-click="setDefault()">Set as default</button>',
              '<button ng-if="!isEditing" type="button" ng-click="edit()">Edit</button>',
              '<button ng-if="!isEditing" type="button" ng-click="new()">New</button>',
              '<button ng-if="isEditing" type="button" ng-click="cancel()">Cancel</button>',
              '<button ng-if="isEditing" type="button" ng-click="save()">Save</button>',
            '</div>',
          '</div>',
          '<div class="selected-container {{ isEditing ? \'editing\' : \'\' }}">',
            '<div ng-if="isEditing" class="selected-filter-header">',
              '<label>Filter\'s name</label><input type="text" ng-model="editingFilter.name" />',
            '</div>',
            '<div class="selected-fields"></div>',
          '</div>',
          '<div ng-show="isEditing" class="available-container {{ isEditing ? \'editing\' : \'\' }}">',
            '<label>Available fields</label>',
            '<div class="available-fields">',
              '<div class="available-field" ng-repeat="field in availableFields track by field.id" data-id="{{ ::field.id }}" draggable="true">',
                '<i ng-class="getFieldClass(field)"></i> {{ ::field.name }}',
              '</div>',
            '</div>',
          '</div>',
          '<div class="source-fields" ng-transclude></div>',
        '</div>'
      ].join('')
    );
  }
  
  
  function directive() {
    return {
      restrict: 'E',
      templateUrl: 'nggs.advanced-drag-drop-filter.html',
      transclude: true,
      scope: {
        filters: '=',
        defaultFilter: '=default',
        onSave: '&',
        onSetDefault: '&'
      },
      controller: controller
    }
    
    controller.$inject = ['$scope', '$element', '$timeout'];
    
    function controller($scope, $element, $timeout) {
      var self = $scope;
      
      var rootElement = $element[0];
      
      var dragging;
      
      var fields = {};
      
      var iconPrefix = 'fa';
      
      self.selectedFilter = self.defaultFilter;
      self.isEditing = false;
      self.editingFilter;
      self.availableFields;

      self.new = newFilter;
      self.edit = editFilter
      self.save = saveFilter
      self.cancel = cancel;
      self.change = changeFilter;
      self.setDefault = setDefault;
      self.getFieldClass = getFieldClass;
      
      var availableFieldRegex = /available-field/;
      var availableFields = rootElement.querySelector('.available-fields');
      var selectedFields = rootElement.querySelector('.selected-fields');
      var sourceFields = rootElement.querySelector('.source-fields');
      
      init();
      
      function init() {
        setupFields();
        setupDestroy();
      }
      
      function changeFilter() {
        clearSelectedFilters();
        setupSelectedFilter();
      }
      
      function clearSelectedFilters() {
        while (selectedFields.firstChild) {
          selectedFields.removeChild(selectedFields.firstChild);
        }
      }
      
      function setDefault() {
        self.onSetDefault({ $event: self.selectedFilter });
      }
      
      function editFilter() {
        self.isEditing = true;
        self.editingFilter = {
          id: self.selectedFilter.id,
          name: self.selectedFilter.name,
          fields: self.selectedFilter.fields.slice()
        }
        setupAvailableFields();
        setupDragNDropListeners();
      }
      
      function getFieldClass(field) {
        var ngClass = {};
        if (iconPrefix) {
          ngClass[iconPrefix] = true;
        }
        ngClass[field.icon] = true;
        return ngClass;
      }
      
      function newFilter() {
        clearSelectedFilters();
        
        self.isEditing = true;
        self.editingFilter = {
          id: null,
          name: null,
          fields: []
        }
        
        setupAvailableFields();
        setupDragNDropListeners();
      }
      
      function saveFilter() {
      
      }
      
      function cancel() {
        self.isEditing = false;
      }
      
      function setupAvailableFields() {
        self.availableFields = [];
        
        Object.keys(fields).forEach(function(key) {
          var indexOf = self.editingFilter.fields.indexOf(key);
          
          var fieldRef = fields[key];
          
          fieldRef.field.setAttribute('draggable', 'true');
          
          if (indexOf === -1) {
            self.availableFields.push(fieldRef);
          }
        });
      }
      
      function setupFields() {
        $timeout(function() {
          var fieldsNodeList = rootElement.querySelectorAll('[draggable=true]');
  
          while (sourceFields.firstChild) {
            sourceFields.removeChild(sourceFields.firstChild);
          }
  
          fieldsNodeList.forEach(function(field) {
            var dataset = field.dataset;
            fields[dataset.id] = {
              id: dataset.id,
              name: dataset.name,
              icon: dataset.icon,
              field: field
            }
          });
          
          setupSelectedFilter();
        });
      }
      
      function setupDragNDropListeners() {
        rootElement.addEventListener('dragstart', onDragStart, true);
        availableFields.addEventListener('dragover', onDragOver, true);
        selectedFields.addEventListener('dragover', onDragOver, true);
        availableFields.addEventListener('drop', onDropAvailable, true);
        selectedFields.addEventListener('drop', onDropSelected, true);
      }
      
      function setupSelectedFilter() {
        if (self.selectedFilter && Array.isArray(self.selectedFilter.fields)) {
          self.selectedFilter.fields.forEach(function(field) {
            var fieldRef = fields[field].field;
            fieldRef.setAttribute('draggable', 'false');
            selectedFields.appendChild(fields[field].field);
          });
        }
      }
      
      function setupDestroy() {
        $element.on('$destroy', function () {
          if (destroyDragNDropListeners) {
            destroyDragNDropListeners();
          }
          $scope.$destroy();
        });
  
        $scope.$on('$destroy', function () {
          if (destroyDragNDropListeners) {
            destroyDragNDropListeners();
          }
        });
      }
      
      function destroyDragNDropListeners() {
        rootElement.removeEventListener('dragstart', onDragStart, true);
        availableFields.removeEventListener('dragover', onDragOver, true);
        selectedFields.removeEventListener('dragover', onDragOver, true);
        availableFields.removeEventListener('drop', onDropAvailable, true);
        selectedFields.removeEventListener('drop', onDropSelected, true);
      }
      
      function onDragStart(event) {
        dragging = event.target;
      }
      
      function onDragOver(event) {
        event.preventDefault();
      }
      
      function onDropSelected(event) {
        if (availableFieldRegex.test(dragging.className)) {
          var field = self.availableFields.find(function(field) {
            return field.id === dragging.dataset.id;
          });
          
          var indexOf = self.availableFields.indexOf(field);

          self.availableFields.splice(indexOf, 1);
          self.editingFilter.fields.push(field.id);
          
          $timeout(function() {
            $scope.$apply();
            selectedFields.appendChild(field.field);
          });
        }
      }
        
      function onDropAvailable(event) {
        if (!availableFieldRegex.test(dragging.className)) {
          var field = fields[dragging.dataset.id];
          
          var indexOf = self.editingFilter.fields.indexOf(field.id);

          self.editingFilter.fields.splice(indexOf, 1);
          self.availableFields.push(field);

          $timeout(function() {
            selectedFields.removeChild(field.field);
            $scope.$apply();
          });
        }
      }
    }
  }
  
})();