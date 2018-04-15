// CHARTS
var barChart = require('./stacked-bar');
var areaChart = require('./stacked-area');

// DATA
var caseStudies = require('../data/case-studies.json'); 
var cards = require('../data/cards.json'); 
var investments = require('../data/capital-investments.json');
var savings = require('../data/cost-savings.json');

// TEMPLATES
var caseStudyTemplate = require('../templates/case-study.hbs');
var cardsTemplate = require('../templates/card.hbs');
var tooltipStackedTemplate = require('../templates/stacked-tooltip.hbs');
var tooltipAreaTemplate = require('../templates/area-tooltip.hbs');


// 
document.addEventListener('DOMContentLoaded', (ev) => {
	// BUILD OUT TEMPLATE CONTENT
	buildCards(cards);
	buildCaseStudies(caseStudies);

	// BUILD THE CHARTS
	barChart.init('#investment-chart', investments, tooltipStackedTemplate);
	areaChart.init('#savings-chart', savings, tooltipAreaTemplate);
});




// CASE STUDIES
function buildCaseStudies(caseStudies) {
	for (var i = 0, l = caseStudies.length; i < l; i++) {
		var id = '#' + caseStudies[i].id;
		var compiledCS = caseStudyTemplate(caseStudies[i]);

		var container = document.querySelector(id);
		if (container) { container.insertAdjacentHTML('beforeend', compiledCS); }
	}	
}

// WHAT'S NEXT CARDS
function buildCards(cards) {
	var cardString = '';
	var cardContainer = document.querySelector('#card-container');

	for (var i = 0, l = cards.length; i < l; i++) {
		cardString += cardsTemplate(cards[i]);
	}

	// Append to the DOM
	cardContainer.insertAdjacentHTML('afterbegin', cardString);
}
