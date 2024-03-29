import { Router } from 'express';

import { isAuthed, hasPermissions } from 'api/utils/permissions';

import Characteristic from 'api/models/characteristic';

const router = Router();

// const debug = require('debug')('api:studio');

router.post(
	'/getCharacteristics',
	isAuthed,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const {
			studioId,
			params: { type },
		} = req.body;

		const conditions = { studio: studioId };

		if (type) conditions.type = type;

		Characteristic.find(conditions)
			.then(characteristics => res.json(characteristics))
			.catch(err => next(err));
	}
);

router.post(
	'/createCharacteristic',
	isAuthed,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const {
			studioId,
			data: { characteristic: newCharacteristic },
		} = req.body;

		const characteristic = new Characteristic({
			studio: studioId,
			...newCharacteristic,
		});

		return characteristic
			.save()
			.then(characteristic => res.json(characteristic))
			.catch(err => next({ code: err.errors ? 5 : 2, err }));
	}
);

export default router;
