$(function() {
  readings.fetch({
    success: function() {
      updateChart();

      readings.on("add", updateChart);

      readings.on('add', function(model, collection) {
        readings.lastReading = readings.lastReading + parseInt(model.get('q'), 10);
      });

      /* tracking models#q edits */
      readings.on('change:q', function () {
        total = readings.reduce(function(sum, item) {
          return sum + parseInt(item.get('q'), 10);
        }, 0);
        readings.lastReading = parseInt(localStorage.initialReading, 10) + total;
      });

      readings.on("offset", function(newOffset) {
        if (newOffset < 0) {
          return;
        } else if (newOffset > (readings.length - 12)) {
          return;
        }

        readings.offset = newOffset;
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

      localStorage.maxConsumption = $('input#maxConsumption').val() || 400;
      readings.maxConsumption = parseInt(localStorage.maxConsumption, 10);

      localStorage.mode = $('[type="radio"]:checked').val();
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