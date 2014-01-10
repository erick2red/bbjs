function updateChart() {
  records = _(readings.initial(readings.offset)).last(12);
  var d1 = [];
  var months = [];
  _(records).each(function(item) {
    d1.push(parseInt(item.get('q'), 10));

    n = new Date(item.get('utc') * 1000);
    months.push(moment(new Date(n.getFullYear(), n.getMonth())).format("MMM"));
  });

  makeChart(d1, months);
}

function makeChart(data, months) {
  var w = 500;
  var h = 480;
  var bw = 30;
  var hmargin = 40;
  var vmargin = 10;

  var vscale = d3.scale.linear()
    .domain([0, 350]) /* plus fifty for margin */
    .range([0, h]);
  var ivScale = d3.scale.linear()
    .domain([350, 0]) /* plus fifty for margin */
    .range([0, h]);

  months = [""].concat(months).concat([""]);
  var xScale = d3.scale.ordinal()
    .domain(months)
    .range(_([0, _.range(26, 500, 38)]).flatten());

  var vAxis = d3.svg.axis()
    .scale(ivScale)
    .orient("left");
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top");

  var svg = d3.select("svg");
  if (svg.selectAll('rect')[0].length < data.length) {
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect");
    svg.selectAll("text.labels")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "labels");
  }

  svg.selectAll("rect")
    .data(data)
    .attr("x", function(item, idx) {
      return hmargin + idx * (bw + 8) + 8;
    })
    .attr("y", function(item) {
      return h - vscale(item) + vmargin;
    })
    .attr("width", bw)
    .attr("height", function(item) {
      return vscale(item);
    })
    .attr("fill", "url(#bar-gradient-1)");

  svg.selectAll("text.labels")
    .data(data)
    .text(function(item) {
      return item;
    })
    .attr("x", function(item, idx) {
      return hmargin + idx * (bw + 8) + 8 + (bw / 2);
    })
    .attr("y", function(item) {
      return h - vscale(item) + 16 + vmargin;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle");

  if (d3.selectAll('g.axis')[0].length === 0) {
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(36,10)")
      .call(vAxis);
  }
  if (d3.selectAll('g.xaxis text')[0].length < 13) {
    d3.selectAll('g.xaxis').remove();
    svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(36,490)")
      .call(xAxis);
  }

  //Update X axis
  svg.select(".axis")
    .call(vAxis);
  //Update X axis
  svg.select(".xaxis")
    .call(xAxis);

  d3.selectAll("rect")
    .on('mouseenter', function(item, idx) {
      $('tbody tr:eq(' + idx + ') td').addClass('info');
      $('tbody tr:eq(' + idx + ') td:last').removeClass('info')
        .addClass('danger');
    })
    .on('mouseleave', function(item, idx) {
      $('tbody tr:eq(' + idx + ') td').removeClass('info');
      $('tbody tr:eq(' + idx + ') td:last').removeClass('danger');
    });
}