import { Router } from 'express';

import { isAuthedResolver, hasPermissions } from 'api/utils/permissions';

import Shop from 'api/models/shop';

const shopsRouter = Router();

// const debug = require('debug')('api:studio');

shopsRouter.post(
	'/getShops',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const { studioId } = req.body;

		Shop.find({ studio: studioId })
			.then(shops => res.json(shops))
			.catch(err => next(err));
	}
);

shopsRouter.post(
	'/createShop',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const {
			studioId,
			data: { shop: newShop },
		} = req.body;

		const shop = new Shop({
			studio: studioId,
			...newShop,
		});

		return shop
			.save()
			.then(shop => res.json(shop))
			.catch(err => next({ code: err.errors ? 5 : 2, err }));
	}
);

export default shopsRouter;