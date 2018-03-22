// DATA
const caseStudies = require('../data/case-studies.json'); 
const cards = require('../data/cards.json'); 

// TEMPLATES
const caseStudyTemplate = require('../templates/case-study.hbs');
const cardsTemplate = require('../templates/card.hbs');


// BUILD OUT TEMPLATE CONTENT
// CASE STUDIES
for (var i = 0, l = caseStudies.length; i < l; i++) {
	const id = '#' + caseStudies[i].id;
	const compiledCS = caseStudyTemplate(caseStudies[i]);

	let container = document.querySelector(id);
	if (container) { container.insertAdjacentHTML('beforeend', compiledCS); }
}


// WHAT'S NEXT CARDS
var cardString = '';
const cardContainer = document.querySelector('#card-container');

for (var i = 0, l = cards.length; i < l; i++) {
	cardString += cardsTemplate(cards[i]);
}

// Append to the DOM
cardContainer.insertAdjacentHTML('afterbegin', cardString);