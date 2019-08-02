import { Router } from 'express';
import { cloneDeep } from 'lodash';

import { checkProductAndMarkers } from 'shared/checkProductAndMarkers';

import { isAuthedResolver, hasPermissionsInStock } from 'api/utils/permissions';

import Stock from 'api/models/stock';
import Product from 'api/models/product';
import Marker from 'api/models/Marker';

const productsRouter = Router();

// const debug = require('debug')('api:products');

productsRouter.get(
	'/products',
	isAuthedResolver,
	(req, res, next) => hasPermissionsInStock(req, res, next, ['products.control']),
	(req, res, next) => {
		const { stockId } = req.query;

		Product.find({
			stock: stockId,
			isArchived: false,
		})
			.collation({ locale: 'ru', strength: 3 })
			.sort({ name: 1 })
			.populate({
				path: 'markers',
				match: { isArchived: false },
				populate: { path: 'manufacturer specifications' },
			})
			.then(products => res.json(products))
			.catch(err => next(err));
	}
);

productsRouter.post(
	'/products/product-markers',
	isAuthedResolver,
	(req, res, next) => hasPermissionsInStock(req, res, next, ['products.control']),
	async (req, res, next) => {
		const { stockId } = req.query;
		const { product: productObject, markers: markersObjects } = req.body;

		await checkProductAndMarkers(productObject, markersObjects);

		let product = new Product(productObject);

		markersObjects.forEach(marker => (marker.product = product._id));

		await Marker.insertMany(markersObjects)
			.then(markers => markers.forEach(marker => product.markers.push(marker._id)))
			.catch(err => next({ code: err.errors ? 5 : 2, err }));

		return product
			.save()
			.then(async product => {
				await product.populate({ path: 'markers', populate: { path: 'manufacturer specifications' } }).execPopulate();

				await Stock.findByIdAndUpdate(
					stockId,
					{
						$inc: {
							'status.numberProducts': 1,
							'status.numberMarkers': product.markers.length,
							'status.stockCost': product.markers.reduce((sum, marker) => sum + marker.quantity * marker.unitPurchasePrice, 0),
						},
					},
					{ runValidators: true }
				).catch(err => next({ code: 2, err }));

				res.json(product);
			})
			.catch(err => next({ code: err.errors ? 5 : 2, err }));
	}
);

productsRouter.put(
	'/products/:productId',
	isAuthedResolver,
	(req, res, next) => hasPermissionsInStock(req, res, next, ['products.control']),
	(req, res, next) => {
		return Product.findById(req.params.productId)
			.populate('markers')
			.then(async product => {
				const productUpdate = { ...req.body };

				if (product.dividedMarkers !== productUpdate.dividedMarkers) {
					const markersIds = product.markers.filter(marker => !marker.isArchived).map(marker => marker._id);

					if (markersIds.length) {
						if (productUpdate.dividedMarkers) {
							await Marker.updateMany(
								{ _id: { $in: markersIds } },
								{ $set: { minimumBalance: product.minimumBalance } },
								{ runValidators: true }
							).catch(err => next({ code: 2, err }));
						} else {
							await Marker.updateMany(
								{ _id: { $in: markersIds } },
								{ $unset: { minimumBalance: 1 } },
								{ runValidators: true }
							).catch(err => next({ code: 2, err }));
						}
					}

					if (productUpdate.dividedMarkers) {
						product.quantity = undefined;
					} else {
						product.quantity = product.markers.reduce((sum, marker) => sum + marker.quantity, 0);
					}
				}

				product.name = productUpdate.name;
				product.dividedMarkers = productUpdate.dividedMarkers;
				product.minimumBalance = productUpdate.minimumBalance;

				await product.save().catch(err => next({ code: err.errors ? 5 : 2, err }));

				await product.populate({ path: 'markers', populate: { path: 'manufacturer specifications' } }).execPopulate();

				res.json(product);
			})
			.catch(err => next({ code: err.errors ? 5 : 2, err }));
	}
);

productsRouter.get(
	'/products/:productId/archive',
	isAuthedResolver,
	(req, res, next) => hasPermissionsInStock(req, res, next, ['products.control']),
	(req, res, next) => {
		Product.findByIdAndUpdate(req.params.productId, { isArchived: true })
			.populate('markers')
			.then(async product => {
				const markersIds = product.markers.filter(marker => !marker.isArchived).map(marker => marker._id);

				if (markersIds.length) {
					await Marker.updateMany({ _id: { $in: markersIds } }, { $set: { isArchived: true } }).catch(err =>
						next({ code: 2, err })
					);
				}

				await Stock.findByIdAndUpdate(
					product.stock,
					{
						$inc: {
							'status.numberProducts': -1,
							'status.numberMarkers': -markersIds.length,
							'status.stockCost': -product.markers.reduce(
								(sum, marker) => (!marker.isArchived ? sum + marker.quantity * marker.unitPurchasePrice : sum),
								0
							),
						},
					},
					{ runValidators: true }
				).catch(err => next({ code: 2, err }));

				res.json('success');
			})
			.catch(err => next({ code: 2, err }));
	}
);

export default productsRouter;
