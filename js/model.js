$(function() {
  console.log("Underscore.VERSION: " + _.VERSION);
  console.log("Backbone.VERSION: " + Backbone.VERSION);

  Reading = Backbone.Model.extend({
    defaults: function() {
      return {
        q: 0,
        utc: readings.nextUTC(),
        editing: false,
      };
    },

    date: function() {
      n = new Date(this.get('utc') * 1000);
      return moment(new Date(n.getFullYear(), n.getMonth())).format("MMMM, YYYY");
    },

    cost: function() {
      v = this.get('q');
      var c = 0.0;

      /* initial 100 */
      if (v <= 100) {
        return v * 0.09;
      } else {
        c += 9.0;
        v -= 100;
      }
      /* 101 - 150  */
      if (v <= 50) {
        return c + v * 0.30;
      } else {
        c += 15.0;
        v -= 50;
      }
      /* 151 - 200  */
      if (v <= 50) {
        return c + v * 0.40;
      } else {
        c += 20.0;
        v -= 50;
      }
      /* 201 - 250  */
      if (v <= 50) {
        return c + v * 0.60;
      } else {
        c += 30.0;
        v -= 50;
      }
      /* 251 - 300  */
      if (v <= 50) {
        return c + v * 0.80;
      } else {
        c += 40.0;
        v -= 50;
      }
      /* 301 - 350  */
      if (v <= 50) {
        return c + v * 1.50;
      } else {
        c += 75.0;
        v -= 50;
      }
      /* 351 - 500  */
      if (v <= 150) {
        return c + v * 1.80;
      } else {
        c += 270.0;
        v -= 150;
      }
      /* 501 - 1000  */
      if (v <= 500) {
        return c + v * 2.00;
      } else {
        c += 1000.0;
        v -= 500;
      }
      /* 1001 - 5000  */
      if (v <= 4000) {
        return c + v * 3.00;
      } else {
        c += 12000.0;
        v -= 4000;
      }

      return c + v * 5.00;
    },

    formatCost: function() {
      value = this.cost();
      places = Math.floor(Math.log(value) / Math.log(10)) + 3;
      return "$ " + value.toPrecision(places);
    }
  });

  Readings = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage("bills-backbone"),

    model: Reading,

    comparator: 'utc',

    offset: 0,

    lastReading: 0,

    maxConsumption: parseInt(localStorage.maxConsumption, 10) || 400,

    nextUTC: function() {
      if (!this.length) {
        return new Date().getTime() / 1000;
      }

      utc = this.last().get('utc') * 1000;
      n = new Date(new Date(utc).getFullYear(), new Date(utc).getMonth() + 1);
      return n.getTime() / 1000;
    },
  });

  window.readings = new Readings();
});