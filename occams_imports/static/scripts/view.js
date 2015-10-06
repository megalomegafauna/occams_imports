function mappedModel(drscForm, drscVariable, siteForm,
                     siteVariable, dateMapped, mappedId){
  'use strict'

  var self = this;

  self.drscForm = ko.observable(drscForm);
  self.drscVariable = ko.observable(drscVariable);
  self.siteForm = ko.observable(siteForm);
  self.siteVariable = ko.observable(siteVariable);
  self.dateMapped = ko.observable(dateMapped);
  self.mappedId = ko.observable(mappedId);
  self.url = '/imports/mappings/view_mapped?id=' + mappedId;
  self.deleteRow = ko.observable(false);
}

function viewMappedVariable(mapped){
  'use strict'

  var self = this;

  $.ajax({
    url: '/imports/mappings/view_mapped',
    method: 'POST',
    data: ko.toJSON({mapped_id: mapped.mappedId}),
    headers: {'X-CSRF-Token': $.cookie('csrf_token')},
    beforeSend: function(){
    },
    success: function(data, textStatus, jqXHR){

    },
    complete: function(){
    }
  });
}

function deleteRows(){
  'use strict'

  var self = this;

  $.ajax({
    url: '/imports/mappings/delete',
    method: 'DELETE',
    data: ko.toJSON({mapped_delete: self.mapped()}),
    headers: {'X-CSRF-Token': $.cookie('csrf_token')},
    beforeSend: function(){
    },
    success: function(data, textStatus, jqXHR){
      self.mapped.remove(function(item) { return item.deleteRow() == true })

      self.isInfo(false);
      self.isSuccess(true);
      self.msgType('Success - ');
      self.msg('All selected records deleted from database.');

      self.numOfMappings(self.mapped().length);
    },
    complete: function(){
    }
  });

}

function formListViewModel(){
  'use strict';

  var self = this;

  self.isReady = ko.observable(false);

  self.mapped = ko.observableArray();

  self.isDanger = ko.observable(false);
  self.isSuccess = ko.observable(false);
  self.msgType = ko.observable('Info - ');
  self.msg = ko.observable('Please click chevron on the right to view mapping.');
  self.isInfo = ko.observable(true);

  self.numOfMappings = ko.observable(0);
  self.filter = ko.observable();

  self.totalShowing  = ko.pureComputed(function(){
    return self.filteredMapped().length;
  });

  // determine if box is checked
  // delete button only visible if at least one box is checked
  self.isChecked = ko.computed(function() {
      var count = 0;
      ko.utils.arrayForEach(self.mapped(), function(item) {
        if (item.deleteRow() == true){
          count += 1
        }
      });
      return count;
    });

  /**
   *  Filtered mappings based on filter string>
   */
  self.filteredMapped = ko.pureComputed(function(){
    var filter = self.filter();

    // No filter, return mapped list
    if (!filter) {
      return self.mapped();
    }

    filter = filter.toLowerCase();

    return self.mapped().filter(function(mapping) {
      return mapping.drscForm().toLowerCase().indexOf(filter) > -1
        || mapping.drscVariable().toLowerCase().indexOf(filter) > -1
        || mapping.siteForm().toLowerCase().indexOf(filter) > -1
        || mapping.siteVariable().toLowerCase().indexOf(filter) > -1
        || mapping.dateMapped().toLowerCase().indexOf(filter) > -1
          });
  }).extend({
    rateLimit: {
      method: 'notifyWhenChangesStop',
      timeout: 400
    }
  });

  // get initial data
  $.ajax({
    url: '/imports/mappings/view',
    method: 'GET',
    headers: {'X-CSRF-Token': $.cookie('csrf_token')},
    beforeSend: function(){
    },
    success: function(data, textStatus, jqXHR){
      var json = $.parseJSON(data);

      $.each(json.rows, function(){
        var row = new mappedModel(this.drsc_form, this.drsc_variable,
          this.site_form, this.site_variable, this.date_mapped,
          this.mapped_id);

        self.mapped.push(row);

      });
    },
    complete: function(){
      self.numOfMappings(self.mapped().length);
      self.isReady(true);
  }
  });
}