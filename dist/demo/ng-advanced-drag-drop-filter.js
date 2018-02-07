'use strict';

(function NgAdvancedDragDropFilter() {
  'use strict';

  angular.module('nggs.advanced-drag-drop-filter', []).provider('ngAdvancedDragDropFilterConfig', ngAdvancedDragDropFilterProvider).run(ngAdvancedDragDropFilterRun).directive('ngAdvancedDragDropFilter', ngAdvancedDragDropFilterDirective);

  function ngAdvancedDragDropFilterProvider() {
    var provider = this;

    var empty = '';
    var defaults = {
      texts: {
        filterSelectionLabelText: 'Filters: ',
        setDefaultButtonText: 'Set as default',
        editButtonText: 'Edit',
        newButtonText: 'New',
        cancelButtonText: 'Cancel',
        saveButtonText: 'Save',
        selectedFilterLabelText: 'Filter\'s name: ',
        availableContainerLabelText: 'Available fields',
        selectedEmptyMessageText: 'Select or create a new filter configuration'
      },
      styleClasses: {
        setDefaultButtonClass: empty,
        editButtonClass: empty,
        newButtonClass: empty,
        cancelButtonClass: empty,
        saveButtonClass: empty,
        selectedEmptyMessageClass: empty
      },
      iconPrefix: '',
      filterValidationFn: empty
    };

    var textsRegex = /text/;
    var styleClassesRegex = /styleClasses/;

    provider.$get = function () {
      return provider;
    };
    provider.getDefaults = getDefaults;
    provider.setDefaults = setDefaults;

    function getDefaults(customConfig) {
      var config = {};

      Object.keys(defaults).forEach(function (key) {
        if (!textsRegex.test(key) && !styleClassesRegex.test(key)) {
          if (isNotNull(defaults[key])) {
            config[key] = defaults[key];
          }
        } else {
          if (isNull(config[key])) {
            config[key] = {};
          }
          if (isNotNull(defaults[key])) {
            Object.keys(defaults[key]).forEach(function (subKey) {
              if (isNotNull(defaults[key][subKey])) {
                config[key][subKey] = defaults[key][subKey];
              }
            });
          }
        }
      });

      if (isNotNull(customConfig)) {
        Object.keys(defaults).forEach(function (key) {
          if (!textsRegex.test(key) && !styleClassesRegex.test(key)) {
            if (isNotNull(customConfig[key])) {
              config[key] = customConfig[key];
            }
          } else {
            if (isNotNull(customConfig[key])) {
              Object.keys(customConfig[key]).forEach(function (subKey) {
                if (isNotNull(customConfig[key][subKey])) {
                  config[key][subKey] = customConfig[key][subKey];
                }
              });
            }
          }
        });
      }

      return config;
    }

    function setDefaults(config) {
      Object.keys(config).forEach(function (key) {
        if (!textsRegex.test(key) && !styleClassesRegex.test(key)) {
          defaults[key] = config[key];
        } else {
          Object.keys(config[key]).forEach(function (subKey) {
            defaults[key][subKey] = config[key][subKey];
          });
        }
      });
    }
  }

  ngAdvancedDragDropFilterRun.$inject = ['$templateCache'];

  function ngAdvancedDragDropFilterRun($templateCache) {
    $templateCache.put('nggs.advanced-drag-drop-filter.html', ['<div class="advanced-drag-drop-filter">', '<div class="control-container">', '<div class="filter-selection">', '<label class="filter-selection-label" ng-bind="::filterSelectionLabelText"></label>', '<select class="filter-selection-select" ng-disabled="isEditing || filters == null || filters.length == 0" ng-model="selected" ng-options="option.name for option in filters track by option.id" ng-change="change()"></select>', '</div>', '<div class="buttons-container">', '<button class="set-default-button {{ ::setDefaultButtonClass }}" ng-if="showEditionButton()" type="button" ng-click="setDefault()" ng-bind="::setDefaultButtonText"></button>', '<button class="edit-button {{ ::editButtonClass }}" ng-if="showEditionButton()" type="button" ng-click="edit()" ng-bind="::editButtonText"></button>', '<button class="new-button {{ ::newButtonClass }}" ng-if="!isEditing" type="button" ng-click="new()" ng-bind="::newButtonText"></button>', '<button class="cancel-button {{ ::cancelButtonClass }}" ng-if="isEditing" type="button" ng-click="cancel()" ng-bind="::cancelButtonText"></button>', '<button class="save-button {{ ::saveButtonClass }}" ng-if="isEditing" ng-disabled="!isFilterValid()" type="button" ng-click="save()" ng-bind="::saveButtonText"></button>', '</div>', '</div>', '<div class="selected-container {{ isEditing ? \'editing\' : \'\' }}">', '<div ng-if="selected == null" class="selected-empty-message {{ ::selectedEmptyMessageClass }}" ng-bind="::selectedEmptyMessageText"></div>', '<div ng-if="isEditing" class="selected-filter-header">', '<label class="selected-filter-label" ng-bind="::selectedFilterLabelText"></label>', '<input class="selected-filter-input" type="text" ng-model="editingFilter.name" />', '</div>', '<div class="selected-fields"></div>', '</div>', '<div ng-show="isEditing" class="available-container {{ isEditing ? \'editing\' : \'\' }}">', '<label ng-bind="::availableContainerLabelText"></label>', '<div class="available-fields">', '<div class="available-field" ng-repeat="field in availableFields track by field.id" data-id="{{ ::field.id }}" draggable="true">', '<i class="available-field-icon" ng-class="getFieldClass(field)"></i> <span class="available-field-name" ng-bind="::field.name"></span>', '</div>', '</div>', '</div>', '<div class="source-fields" ng-transclude></div>', '</div>'].join(''));
  }

  function ngAdvancedDragDropFilterDirective() {
    return {
      restrict: 'E',
      templateUrl: 'nggs.advanced-drag-drop-filter.html',
      transclude: true,
      scope: {
        filters: '=',
        selected: '=',
        options: '=',
        onSave: '&',
        onSetDefault: '&',
        onChangeFilter: '&'
      },
      controller: ngAdvancedDragDropFilterController
    };
  }

  ngAdvancedDragDropFilterController.$inject = ['$scope', '$element', '$timeout', 'ngAdvancedDragDropFilterConfig'];

  function ngAdvancedDragDropFilterController($scope, $element, $timeout, ngAdvancedDragDropFilterConfig) {
    var self = $scope;
    var rootElement = $element[0];

    var availableFields = rootElement.querySelector('.available-fields');
    var availableFieldRegex = /available-field/;
    var config = {};
    var dragging;
    var fields = {};
    var filterValidationFn = defaultValidationFn;
    var iconPrefix = '';
    var selectedFields = rootElement.querySelector('.selected-fields');
    var $selected;
    var sourceFields = rootElement.querySelector('.source-fields');
    var styleClassesRegex = /Class$/;
    var textRegex = /Text$/;

    self.availableContainerLabelText = null;
    self.availableFields = null;
    self.cancelButtonClass = null;
    self.cancelButtonText = null;
    self.editButtonClass = null;
    self.editButtonText = null;
    self.editingFilter = null;
    self.filterSelectionLabelText = null;
    self.isEditing = false;
    self.newButtonClass = null;
    self.newButtonText = null;
    self.saveButtonClass = null;
    self.saveButtonText = null;
    self.selectedFilterLabelText = null;
    self.selectedEmptyMessageText = null;
    self.setDefaultButtonClass = null;
    self.setDefaultButtonText = null;

    self.cancel = cancel;
    self.change = changeFilter;
    self.edit = editFilter;
    self.getFieldClass = getFieldClass;
    self.isFilterValid = isFilterValid;
    self.new = newFilter;
    self.save = saveFilter;
    self.setDefault = setDefault;
    self.showEditionButton = showEditionButton;

    init();

    function cancel() {
      self.isEditing = false;
      self.editingFilter = null;
      destroyDragNDropListeners();
      setupSelectedFilter();
    }

    function changeFilter() {
      setupSelectedFilter();
      self.onChangeFilter({ $event: self.selected });
    }

    function clearSelectedFilters() {
      while (selectedFields.firstChild) {
        selectedFields.removeChild(selectedFields.firstChild);
      }
    }

    function defaultValidationFn(filter) {
      return filter.name && filter.name.length > 0 && filter.fields.length > 0;
    }

    function destroy() {
      destroyDragNDropListeners();

      if ($selected) {
        $selected();
      }
    }

    function destroyDragNDropListeners() {
      rootElement.removeEventListener('dragstart', onDragStart, true);
      availableFields.removeEventListener('dragover', onDragOver, true);
      selectedFields.removeEventListener('dragover', onDragOver, true);
      availableFields.removeEventListener('drop', onDropAvailable, true);
      selectedFields.removeEventListener('drop', onDropSelected, true);
    }

    function editFilter() {
      self.isEditing = true;

      self.editingFilter = {
        id: self.selected.id,
        name: self.selected.name,
        fields: self.selected.fields.slice()
      };

      setupAvailableFields();
      setupDragNDropListeners();
    }

    function getFieldClass(field) {
      var ngClass = {};
      ngClass[iconPrefix] = true;
      ngClass[field.icon] = true;
      return ngClass;
    }

    function init() {
      setupConfig();
      setupWatcher();
      setupFields();
      setupDestroy();
    }

    function isFilterValid() {
      console.log(filterValidationFn);
      return filterValidationFn(self.editingFilter);
    }

    function newFilter() {
      clearSelectedFilters();

      self.isEditing = true;
      self.editingFilter = {
        id: null,
        name: null,
        fields: []
      };

      setupAvailableFields();
      setupDragNDropListeners();
    }

    function onDragStart(event) {
      dragging = event.target;
      dragging.className += ' dragging';
    }

    function onDragOver(event) {
      event.preventDefault();
    }

    function onDropAvailable() {
      dragging.className = dragging.className.replace(/dragging/, '');

      if (!availableFieldRegex.test(dragging.className)) {
        var field = fields[dragging.dataset.id];

        var indexOf = self.editingFilter.fields.indexOf(field.id);

        self.editingFilter.fields.splice(indexOf, 1);
        self.availableFields.push(field);

        $timeout(function () {
          selectedFields.removeChild(field.field);
          $scope.$apply();
        });
      }
    }

    function onDropSelected() {
      dragging.className = dragging.className.replace(/dragging/, '');

      if (availableFieldRegex.test(dragging.className)) {
        var field = self.availableFields.find(function (field) {
          return field.id === dragging.dataset.id;
        });

        var indexOf = self.availableFields.indexOf(field);

        self.availableFields.splice(indexOf, 1);
        self.editingFilter.fields.push(field.id);

        $timeout(function () {
          $scope.$apply();
          selectedFields.appendChild(field.field);
        });
      }
    }

    function saveFilter() {
      if (isFilterValid()) {
        self.isEditing = false;
        self.onSave({ $event: self.editingFilter });
        self.editingFilter = null;
        destroyDragNDropListeners();
        setupSelectedFilter();
      }
    }

    function setDefault() {
      self.onSetDefault({ $event: self.selected });
    }

    function setupAvailableFields() {
      self.availableFields = [];

      Object.keys(fields).forEach(function (key) {
        var indexOf = self.editingFilter.fields.indexOf(key);

        var fieldRef = fields[key];

        fieldRef.field.setAttribute('draggable', 'true');

        if (indexOf === -1) {
          self.availableFields.push(fieldRef);
        }
      });
    }

    function setupConfig() {
      config = ngAdvancedDragDropFilterConfig.getDefaults($scope.options);

      iconPrefix = config.iconPrefix;
      if (isNotNull(config.filterValidationFn) && isFunction(config.filterValidationFn)) {
        filterValidationFn = config.filterValidationFn;
      }

      setupStyleClasses();
      setupTexts();
    }

    function setupDragNDropListeners() {
      rootElement.addEventListener('dragstart', onDragStart, true);
      availableFields.addEventListener('dragover', onDragOver, true);
      selectedFields.addEventListener('dragover', onDragOver, true);
      availableFields.addEventListener('drop', onDropAvailable, true);
      selectedFields.addEventListener('drop', onDropSelected, true);
    }

    function setupDestroy() {
      $element.on('$destroy', function () {
        destroy();
        $scope.$destroy();
      });

      $scope.$on('$destroy', function () {
        destroy();
      });
    }

    function setupFields() {
      $timeout(function () {
        var fieldsNodeList = rootElement.querySelectorAll('[draggable=true]');

        while (sourceFields.firstChild) {
          sourceFields.removeChild(sourceFields.firstChild);
        }

        fieldsNodeList.forEach(function (field) {
          var dataset = field.dataset;

          if (isNull(dataset.id) || isNull(dataset.name)) {
            throw new Error('All draggable fields must have the attributes: data-id and data-name');
          }

          fields[dataset.id] = {
            id: dataset.id,
            name: dataset.name,
            icon: dataset.icon,
            field: field
          };
        });

        setupSelectedFilter();
      });
    }

    function setupSelectedFilter() {
      clearSelectedFilters();
      if (self.selected && Array.isArray(self.selected.fields)) {
        self.selected.fields.forEach(function (field) {
          var fieldRef = fields[field];
          if (isNotNull(fieldRef)) {
            fieldRef.field.setAttribute('draggable', 'false');
            selectedFields.appendChild(fields[field].field);
          }
        });
      }
    }

    function setupStyleClasses() {
      Object.keys(config.styleClasses).forEach(function (key) {
        if (styleClassesRegex.test(key) && config.styleClasses[key].length) {
          self[key] = config.styleClasses[key];
        }
      });
    }

    function setupTexts() {
      Object.keys(config.texts).forEach(function (key) {
        if (textRegex.test(key) && config.texts[key].length) {
          self[key] = config.texts[key];
        }
      });
    }

    function setupWatcher() {
      $selected = $scope.$watch('selected', function () {
        if (!self.isEditing) {
          setupSelectedFilter();
        }
      });
    }

    function showEditionButton() {
      return !self.isEditing && self.selected;
    }
  }

  function isFunction(param) {
    return typeof param === 'function';
  }

  function isNotNull(param) {
    return !isNull(param);
  }

  function isNull(param) {
    return param == null;
  }
})();
//# sourceMappingURL=ng-advanced-drag-drop-filter.js.map
