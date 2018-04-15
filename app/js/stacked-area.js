var d3 = require('d3');


var margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 75
};

var yAxisLabel = 'Yearly Energy Costs ($)';
var parseDate = d3.timeParse('%Y');
var colors = {
	'bau': 'rgba(202, 202, 202, 1)', 
	'lc_amb': 'rgba(17, 100, 142, 1)'
};
var labels = {
	'bau': 'Business as Usual', 
	'lc_amb': 'Energy Shift Program'
};



var app = {
	init: function(el, data, tooltipTemplate) {
		this.el = el;
		this.data = data;
		this.tooltipTemplate = tooltipTemplate;

		// add tooltip, keys & prep data
		this.addTooltip(el);
		this.keys = this.setDataKeys(data);
		this.groupedData = this.processData(data);

		// let's get to work!
		this.buildChart();

		window.addEventListener('resize', this.buildChart);
	},
	addLegendKey: function(color, label, legendEl) {
		var legend = legendEl
			.append('li')
			.attr('class', 'legend');

		legend.append('div')
			.attr('class', 'swatch')
			.style('background-color', color);

		legend.append('p')
			.style('text-anchor', 'start')
			.text(function(d, i) { return label; });
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

		// chart & legend
		var legendEl = d3.select(app.el).append('ul').attr('class', 'legend-container');

		for (var key in app.groupedData) {
			app.drawData(app.groupedData[key], key, svg);
			app.addLegendKey(colors[key], labels[key], legendEl);
		}

		console.log(app)
	},
	configureAxes: function(data) {
		var height = this.height;
		var width = this.width;

		var yMax = d3.max(data, function(d) {
			if (d.bau > d.lc_amb) {
				return d.bau;
			} else {
				return d.lc_amb;
			}
		});
		
		// this.x = d3.scaleTime()
		this.x = d3.scaleLinear()
    		.rangeRound([0, width])
    		.domain(d3.extent(data, function(d) { return d.date }));


		this.y = d3.scaleLinear()
    		.rangeRound([height, 0])
    		.domain([0, yMax])
    		.nice();

		this.xAxis = d3.axisBottom(this.x)
			.ticks(10)
			.tickFormat(d3.format(''))
			.tickSize(0);

		this.yAxis = d3.axisLeft(this.y)
			.ticks(5)
			.tickSize(-width);
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
	drawData: function(data, key, svg) {
		var tooltip = app.tooltip;

		var area = d3.area()
			.x(function(d) { return app.x(d.date); })
			.y1(function(d) { return app.y(d.value); 
			})
			.y0(app.y(0));
		
		svg.append('path')
			.datum(data)
			.attr('fill', colors[key])
			.attr('d', area)
			.on('mousemove', app.mouseover)
			.on('mouseout', function(d) {
				tooltip.transition()
					.duration(200)
					.style('opacity', 0);
			});
	},
	mouseover: function(d) {
		var ttData = {};
		var f = d3.format(',.0f');
		var tooltip = app.tooltip;
		var tooltipWidth = tooltip.node().getBoundingClientRect().width;
		
		// get data for tooltip
		var mouseX = d3.mouse(this)[0]
		ttData.year = Math.round(app.x.invert(mouseX));
		var values = app.data.filter(function(d) {
			return d.date === ttData.year;
		});
		
		// prep for display
		ttData.bau = f(values[0].bau);
		ttData.lc_amb = f(values[0].lc_amb);
		ttData.difference = f(values[0].bau - values[0].lc_amb);
		var htmlString = app.tooltipTemplate(ttData);

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
	processData: function(data) {
		var groupedData = {};

		app.keys.forEach(function(key) {
			groupedData[key] = [];
			data.forEach(function(d) {
				var entry = {
					date: d.date,
					value: d[key]
				}
				groupedData[key].push(entry);
			});
		});
		
		return groupedData;
	},
	setDataKeys: function(data) {
		var keys = d3.keys(data[0]);

		// remove the year field
		var keys = keys.filter(function(key) { 
			if (key !== 'date') { return key; }
		});

		return keys;
	},
	setDimensions: function(el) {
		var width = document.querySelector(el).offsetWidth;
		this.height = width / 4;
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
};

module.exports = app;