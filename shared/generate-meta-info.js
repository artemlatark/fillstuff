const { truncate } = require('./truncate');
const striptags = require('striptags');
// const draft = require('./draft-utils');

const DEFAULT_META = {
	title: 'Fillstuff',
	description: 'Складской учет для тату-студий',
};

// const HIDE_FROM_CRAWLERS = '<meta name="robots" content="noindex, nofollow">';

function setDefault(input) {
	let title = input.title || DEFAULT_META.title;
	let description = input.description || DEFAULT_META.description;

	if (input.title && !input.description) {
		description = DEFAULT_META.description;
	}

	return {
		title: title,
		description: cleanDescription(description),
		extra: input.extra || '',
	};
}

function cleanDescription(input) {
	return truncate(striptags(input), 160);
}

function generateMetaInfo(input) {
	let exists = input || {};
	let type = exists.type;
	let data = exists.data;

	switch (type) {
		// case 'explore': {
		// 	return {
		// 		title: 'Explore ·',
		// 		description: 'Explore some of the communities on',
		// 	};
		// }
		// case 'thread': {
		// 	if (data.privateChannel)
		// 		return setDefault({
		// 			extra: HIDE_FROM_CRAWLERS,
		// 		});
		//
		// 	var body = data && data.body && (data.type === 'DRAFTJS'
		// 	                                 ? draft.toPlainText(draft.toState(JSON.parse(data.body)))
		// 	                                 : data.body);
		// 	return setDefault({
		// 		title: data && data.title + ' · ' + data.communityName,
		// 		description: body,
		// 	});
		// }
		case 'login':
		case 'signup':
		case 'password-recovery':
		case 'dashboard':
		case 'stock':
		case 'position':
		case 'write-offs':
		case 'stocktaking':
		case 'procurements':
		case 'procurement':
		case 'invoices':
		case 'invoice':
		case 'members':
		case 'member':
		case 'statistics':
		case 'settings':
		case 'notfound':
		case 'user-settings':
			return setDefault({
				title: data && data.title,
				description: data && data.description,
			});
		// case 'channel': {
		// 	if (data.private)
		// 		return setDefault({
		// 			extra: HIDE_FROM_CRAWLERS,
		// 		});
		// 	return setDefault({
		// 		title: data && data.communityName + ' · ' + data.name,
		// 		description: data && data.description,
		// 	});
		// }
		default:
			return DEFAULT_META;
	}
}

module.exports = generateMetaInfo;
