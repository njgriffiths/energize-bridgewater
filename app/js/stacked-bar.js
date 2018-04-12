var d3 = require('d3');


var margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 75
};

var barWidth;
var yAxisLabel = 'Capital Investments ($)';


var colors = ['#BBCDA3', '#055C81', '#B13C3D'];
var colors = ['rgba(17, 100, 142, 0.4)', 'rgba(17, 100, 142, 1)', 'rgba(17, 100, 142, 0.7)']; 
var labels = ['Energy Efficient Buildings', 'Community-Scale Energy Systems', 'Clean & Active Transportation Systems'];


var formatTime = d3.timeFormat('%Y');
var parseDate = d3.timeParse('%Y');


var app = {
	init: function(el, data, tooltipTemplate) {

		// data prep
		var keys = this.setDataKeys(data);
		this.color = this.assignColors(keys);
		this.tooltipTemplate = tooltipTemplate;

		data.forEach(function(d) {
			var y0_positive = 0;
			var y0_negative = 0;
			var year = d.date

			d.components = keys.map(function(key) {
				if (d[key] >= 0) {
					return {
						key: key,
						y1: y0_positive,
						y0: y0_positive += d[key],
						value: d[key],
						date: year
					};
				} else if (d[key] < 0) {
					return {
						key: key,
						y0: y0_negative,
						y1: y0_negative += d[key],
						value: d[key],
						date: year
					};
				}
			})
		});
		this.el = el;
		this.data = data;
		
		// let's get to work!
		this.buildChart();

		window.addEventListener('resize', this.buildChart);
	},
	assignColors: function(keys) {
		return d3.scaleOrdinal()
			.range(colors)
			.domain(keys);
	},
	addLegend: function(color, el, svg) {
		var legendEl = d3.select(el).append('ul').attr('class', 'legend-container');
		
		var legend = legendEl.selectAll('.legend')
			.data(colors)
			.enter().append('li')
			.attr('class', 'legend');

		legend.append('div')
			.attr('class', 'swatch')
			.style('background-color', color);

		legend.append('p')
			.style('text-anchor', 'start')
			.text(function(d, i) { return labels[i]; });
	},
	addTooltip: function(el) {
		this.tooltip = d3.select('body').append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0);
	},
	buildChart: function() {
		// clear contents & set chart dimensions
		app.setDimensions(app.el);
		document.querySelector(app.el).innerHTML = '';

		// svg & axes
		var svg = app.configureSVG(app.el);
		app.configureAxes(app.data);
		app.drawAxes(svg);

		// chart, toolip & legend
		app.addTooltip(app.el);
		app.drawChart(app.data, svg);
		app.addLegend(app.color, app.el, svg);
		
	},
	configureSVG: function(el) {
		var height = this.height;
		var width = this.width;

		return d3.select(el).append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	},
	configureAxes: function(data) {
		var height = this.height;
		var width = this.width;

		// y_min/y_max are a bit brittle...
		var y_min = d3.min(data, function(d) { return d.s3; });
		var y_max = d3.max(data, function(d) { return d.s1 + d.s2 });
		var datestart = d3.min(data, function(d) { return parseDate(d.date); });
		var dateend = d3.max(data, function(d) { return parseDate(d.date); });

		this.x = d3.scaleTime()
			.rangeRound([0, width])
			.domain([datestart, dateend]);

		this.y = d3.scaleLinear()
			.rangeRound([height, margin.top])
			.domain([y_min, y_max])
			.nice();

		this.xAxis = d3.axisBottom(this.x)
			.ticks(10)
			.tickSize(0);

		this.yAxis = d3.axisLeft(this.y)
			.ticks(10)
			.tickSize(-width);
	},
	drawAxes: function(svg) {
		var y = this.y;
		var height = this.height;

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(this.xAxis);

		svg.append('g')
			.attr('class', 'y axis')
			.call(this.yAxis);

		this.yAxisLabel(height, svg);
	},
	drawChart: function(data, svg) {
		var x = this.x;
		var y = this.y;
		var color = this.color;
		var tooltip = this.tooltip;

		// group each bar
		var bar = svg.selectAll('.bar')
			.data(data)
			.enter().append('g')
			.attr('class', 'g bar')
			.attr('transform', function(d) { return 'translate(' + x(parseDate(d.date)) + ', 0)'; });

		// draw the segments of each bar & add attributes
		bar.selectAll('rect')
			.data(function(d) { return d.components; })
			.enter().append('rect')
			.attr('width', app.barWidth)
			.attr('height', function(d) { return Math.abs(y(d.y0) - y(d.y1)); })
			.attr('y', function(d) { return y(d.y0); })
			.style('fill', function(d) { return color(d.key); } )
			.on('mouseover', app.mouseover)
			.on('mouseout', function(d) {
				tooltip.transition()
					.duration(500)
					.style('opacity', 0);
				});
	},
	mouseover: function(d) {
		var tooltip = app.tooltip;
		var tooltipWidth = tooltip.node().getBoundingClientRect().width;

		// prep tooltip content
		var key = d.key;
		var strategy = labels[parseInt(key.substr(1)) - 1];
		d.ttValue = d3.format(',.0f')(d.value);
		d.strategy = strategy.toLowerCase();
		var htmlString = app.tooltipTemplate(d);

		// show tooltip
		tooltip.transition()
			.duration(200)
			.style('opacity', 1);

		// reposition the tooltip so it stays in the viewport
		var xPos = (d3.event.pageX + 10) + 'px';
		if (d3.event.pageX + tooltipWidth > window.innerWidth) {
			xPos = (d3.event.pageX - tooltipWidth - 10) + 'px';
		}

		// update content
		tooltip.html(htmlString)
			.style('left', xPos)
			.style('top', (d3.event.pageY - 28) + 'px');
	},
	setDataKeys: function(data) {
		var keys = d3.keys(data[0]);

		// remove the year field
		var keys = keys.filter(function(key) { 
			if (key !== 'year') { return key; }
		});

		return keys;
	},
	setDimensions: function(el) {
		var width = document.querySelector(el).offsetWidth;
		this.height = width / 2;
		this.width = width - margin.left - margin.right;

		this.barWidth = Math.ceil(width / (app.data.length * 2));
	},
	yAxisLabel: function(height, svg) {
		svg.append('text')
			.attr('y', 0)
			.attr('x', 0 - (margin.left * 0.75) )
			.attr('class', 'y-axis-label')
			.style('text-anchor', 'start')
			.text(yAxisLabel); 
  	}
}

module.exports = app;