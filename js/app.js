$(function() {
  RecordsView = Backbone.View.extend({
    initialize: function(options) {
      this.el = options.el;

      this.readingInput = this.$('#newReading');
      this.valueInput = this.$('#newValue');

      this.tableBody = this.$("table > tbody");

      this.row = _.template("<tr><td><%= date %></td><td><%= q %></td><td><%= cost %></td></tr>");

      this.listenTo(readings, "add", this.render);
    },

    events: {
      "keypress #newValue": "addValue",
      "keypress #newReading": "addReading",
      "click #older": "showOlder",
      "click #newer": "showNewer",
    },

    addValue: function(e) {
      if (e.keyCode != 13) return;
      if (!this.valueInput.val()) return;

      readings.create({
        q: this.valueInput.val(),
      });

      this.valueInput.val('');
    },

    addReading: function(e) {
      if (e.keyCode != 13) return;
      if (!this.readingInput.val()) return;

      readings.create({
        q: parseInt(this.readingInput.val(), 10) - readings.lastReading,
      });

      this.readingInput.val('');
    },

    showOlder: function(e) {
      readings.trigger("offset", readings.offset + 1);
      return false;
    },

    showNewer: function(e) {
      readings.trigger("offset", readings.offset - 1);
      return false;
    },

    render: function() {
      this.tableBody.find("tr").remove();
      records = _(readings.initial(readings.offset)).last(12);
      _(records).each(function(item, idx, list) {
        this.tableBody.append(this.row({
          date: item.date(),
          q: item.get('q'),
          cost: item.formatCost(),
        }));
      }, this);

      if (readings.offset === 0) {
        $('li.next').addClass("disabled");
      } else {
        $('li.next').removeClass("disabled");
      }

      if (readings.offset === readings.length - 12 ||
        readings.length <= 12) {
        $('li.previous').addClass("disabled");
      } else {
        $('li.previous').removeClass("disabled");
      }

      return this;
    },
  });

  /* main app code */
  window.d = new RecordsView({
    el: 'div#data-view'
  });
  d.render();

  readings.fetch({
    success: function() {
      updateChart();

      readings.on("add", updateChart);

      readings.on('add', function(model, collection) {
        readings.lastReading = readings.lastReading + parseInt(model.get('q'), 10);
      });

      readings.on("offset", function(newOffset) {
        if (newOffset < 0) {
          return;
        } else if (newOffset > (readings.length - 12)) {
          return;
        }

        readings.offset = newOffset;
        d.render();
        updateChart();
      });

      if (localStorage.initialReading) {
        /* setting last reading */
        total = readings.reduce(function(sum, item) {
          return sum + parseInt(item.get('q'), 10);
        }, 0);
        readings.lastReading = parseInt(localStorage.initialReading, 10) + total;
      }
    }
  });

  /* initial data population */
  if (localStorage.initialReading === undefined) {
    $('#welcome').on('hidden.bs.modal', function(e) {
      localStorage.initialReading = $('input#initialReading').val();

      /* setting last reading */
      total = readings.reduce(function(sum, item) {
        return sum + parseInt(item.get('q'), 10);
      }, 0);
      readings.lastReading = parseInt(localStorage.initialReading, 10) + total;
    });

    $("#welcome form").on('submit', function(e) {
      if (!$('input#initialReading').val()) return;

      $('#welcome').modal('hide');
      return false;
    });

    $("#welcome button").on('click', function(e) {
      if (!$('input#initialReading').val()) return;

      $('#welcome').modal('hide');
    });

    $("#welcome").modal({
      backdrop: 'static',
      keyboard: false,
    });
  }
});