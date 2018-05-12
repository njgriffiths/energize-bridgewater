// CHARTS
var barChart = require('./stacked-bar');
var areaChart = require('./stacked-area');
var Tabletop = require('Tabletop');

// DATA
var investments = require('../data/capital-investments.json');
var savings = require('../data/cost-savings.json');
var templateDataUrl = 'https://docs.google.com/spreadsheets/d/1JpecwSGSjuscdhpk7WyQ2U06qgH-Uj7Tcwgtk0Grdn4/edit?usp=sharing';

// TEMPLATES
var caseStudyTemplate = require('../templates/case-study.hbs');
var cardsTemplate = require('../templates/card.hbs');
var tooltipStackedTemplate = require('../templates/stacked-tooltip.hbs');
var tooltipAreaTemplate = require('../templates/area-tooltip.hbs');


// 
document.addEventListener('DOMContentLoaded', (ev) => {
	// FETCH CONTENT FROM THE GOOGLE SHEET
	Tabletop.init({
	 	key: templateDataUrl,
		callback: parseTemplateData
	});

	// BUILD THE CHARTS
	barChart.init('#investment-chart', investments, tooltipStackedTemplate);
	areaChart.init('#savings-chart', savings, tooltipAreaTemplate);
});


function parseTemplateData(data, tabletop) {
	// EXTRACT INFO FROM SPECIFIC SHEETS
	var cards = tabletop.sheets('cards').all();
	var caseStudies = tabletop.sheets('case_studies').all();

	// BUILD THE TEMPLATES
	buildCards(cards);
	buildCaseStudies(caseStudies);
}

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
