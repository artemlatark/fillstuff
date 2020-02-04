import { Router } from 'express';

import { receiptCalc } from 'shared/checkPositionAndReceipt';

import { isAuthedResolver, hasPermissions } from 'api/utils/permissions';

import Studio from 'api/models/studio';
import Position from 'api/models/position';
import PositionGroup from 'api/models/positionGroup';
import Receipt from 'api/models/receipt';

const positionsRouter = Router();

// const debug = require('debug')('api:products');

positionsRouter.post(
	'/getPositions',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const { studioId } = req.body;

		const positionsPromise = Position.find({
			studio: studioId,
			isArchived: false,
		})
			.populate({
				path: 'activeReceipt characteristics',
			})
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.catch(err => next({ code: 2, err }));

		const compareByName = (a, b) => {
			if (a.name > b.name) return 1;
			else if (a.name < b.name) return -1;
			else return 0;
		};

		const positions = await positionsPromise;

		res.json(positions.sort(compareByName));
	}
);

positionsRouter.post(
	'/getPositionsAndGroups',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const { studioId } = req.body;

		const positionsPromise = Position.find({
			studio: studioId,
			isArchived: false,
			positionGroup: { $exists: false },
		})
			.populate({
				path: 'activeReceipt characteristics',
			})
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.catch(err => next({ code: 2, err }));

		const positionGroupsPromise = PositionGroup.find({
			studio: studioId,
		})
			.populate({
				path: 'positions',
				populate: {
					path: 'activeReceipt characteristics',
				},
			})
			.populate({
				path: 'positions',
				populate: {
					path: 'receipts',
					match: { status: /received|active/ },
				},
			})
			.catch(err => next({ code: 2, err }));

		const positions = await positionsPromise;
		const positionGroups = await positionGroupsPromise;
		const compareByName = (a, b) => {
			if (a.name > b.name) return 1;
			else if (a.name < b.name) return -1;
			else return 0;
		};

		const positionsInGroups = [...positions, ...positionGroups].sort(compareByName);

		res.json(positionsInGroups);
	}
);

positionsRouter.post(
	'/getPosition',
	// isAuthedResolver,
	// (req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const {
			params: { positionId },
		} = req.body;

		Position.findById(positionId)
			.populate('characteristics')
			.populate('activeReceipt')
			.then(position => res.json(position))
			.catch(err => next({ code: 2, err }));
	}
);

positionsRouter.post(
	'/createPosition',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			studioId,
			data: { position: newPositionValues },
		} = req.body;

		const newPosition = new Position({
			...newPositionValues,
			studio: studioId,
		});

		const newPositionErr = newPosition.validateSync();

		if (newPositionErr) return next({ code: newPositionErr.errors ? 5 : 2, err: newPositionErr });

		await Promise.all([newPosition.save()]);

		const position = await Position.findById(newPosition._id)
			.populate({ path: 'studio', select: 'numberPositions' })
			.populate({
				path: 'characteristics',
			})
			.catch(err => next({ code: 2, err }));

		const {
			studio: { numberPositions: numberPositionsOld },
		} = position;

		Studio.findByIdAndUpdate(
			position.studio._id,
			{
				$set: {
					numberPositions: numberPositionsOld + 1,
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		position.depopulate('studio');

		res.json(position);
	}
);

positionsRouter.post(
	'/editPosition',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { positionId },
			data: { position: positionEdited },
		} = req.body;

		const position = await Position.findById(positionId).catch(err => next({ code: 2, err }));

		position.name = positionEdited.name;
		position.unitReceipt = positionEdited.unitReceipt;
		position.unitIssue = positionEdited.unitIssue;
		position.minimumBalance = positionEdited.minimumBalance;
		position.isFree = positionEdited.isFree;
		position.extraCharge = positionEdited.extraCharge;
		position.shopName = positionEdited.shopName;
		position.shopLink = positionEdited.shopLink;
		position.characteristics = positionEdited.characteristics;

		const positionErr = position.validateSync();

		if (positionErr) return next({ code: positionErr.errors ? 5 : 2, err: positionErr });

		await Promise.all([position.save()]);

		Position.findById(position._id)
			.populate({
				path: 'characteristics',
			})
			.then(position => res.json(position))
			.catch(err => next({ code: 2, err }));
	}
);

positionsRouter.post(
	'/createPositionWithReceipt',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			studioId,
			data: { position: newPositionValues, receipt: newReceiptValues },
		} = req.body;

		const newReceipt = new Receipt({
			...newReceiptValues,
			studio: studioId,
			status: 'active',
			comment: 'Создание позиции',
		});

		const newPosition = new Position({
			...newPositionValues,
			studio: studioId,
			activeReceipt: newReceipt._id,
			receipts: [newReceipt],
		});

		newReceipt.position = newPosition._id;

		receiptCalc.quantity(newReceipt, {
			unitReceipt: newPosition.unitReceipt,
			unitIssue: newPosition.unitIssue,
		});
		receiptCalc.unitPurchasePrice(newReceipt, {
			unitReceipt: newPosition.unitReceipt,
			unitIssue: newPosition.unitIssue,
		});
		receiptCalc.sellingPrice(newReceipt, {
			isFree: newPosition.isFree,
			extraCharge: newPosition.extraCharge,
		});
		receiptCalc.manualExtraCharge(newReceipt, {
			isFree: newPosition.isFree,
			unitReceipt: newPosition.unitReceipt,
			unitIssue: newPosition.unitIssue,
		});

		const newReceiptErr = newReceipt.validateSync();
		const newPositionErr = newPosition.validateSync();

		if (newReceiptErr) return next({ code: newReceiptErr.errors ? 5 : 2, err: newReceiptErr });
		if (newPositionErr) return next({ code: newPositionErr.errors ? 5 : 2, err: newPositionErr });

		await Promise.all([newReceipt.save(), newPosition.save()]);

		const position = await Position.findById(newPosition._id)
			.populate({ path: 'studio', select: 'stock' })
			.populate({
				path: 'activeReceipt characteristics',
			})
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.catch(err => next({ code: 2, err }));

		const {
			studio: {
				stock: { numberPositions: numberPositionsOld, stockPrice: stockPriceOld },
			},
			activeReceipt,
		} = position;

		Studio.findByIdAndUpdate(
			position.studio._id,
			{
				$set: {
					'stock.numberPositions': numberPositionsOld + 1,
					'stock.stockPrice': stockPriceOld + activeReceipt.current.quantity * activeReceipt.unitPurchasePrice,
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		position.depopulate('studio');

		res.json(position);
	}
);

positionsRouter.post(
	'/editPositionWithReceipt',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { positionId },
			data: { position: positionEdited, receipt: receiptEdited },
		} = req.body;

		const position = await Position.findById(positionId)
			.populate({ path: 'studio', select: 'stock' })
			.populate('activeReceipt')
			.catch(err => next({ code: 2, err }));

		const {
			studio: {
				stock: { stockPrice: stockPriceOld },
			},
			activeReceipt,
		} = position;
		const activeReceiptOld = position.activeReceipt.toObject();

		if (receiptEdited.quantityInUnit) activeReceipt.quantityInUnit = receiptEdited.quantityInUnit;
		if (receiptEdited.purchasePrice) activeReceipt.purchasePrice = receiptEdited.purchasePrice;
		if (receiptEdited.sellingPrice) activeReceipt.sellingPrice = receiptEdited.sellingPrice;
		if (receiptEdited.unitSellingPrice) activeReceipt.unitSellingPrice = receiptEdited.unitSellingPrice;

		receiptCalc.unitPurchasePrice(activeReceipt, {
			unitReceipt: position.unitReceipt,
			unitIssue: position.unitIssue,
		});
		receiptCalc.sellingPrice(activeReceipt, {
			isFree: position.isFree,
			extraCharge: position.extraCharge,
		});
		receiptCalc.manualExtraCharge(activeReceipt, {
			isFree: position.isFree,
			unitReceipt: position.unitReceipt,
			unitIssue: position.unitIssue,
		});

		position.name = positionEdited.name;
		position.minimumBalance = positionEdited.minimumBalance;
		position.isFree = positionEdited.isFree;
		position.extraCharge = positionEdited.extraCharge;
		position.shopName = positionEdited.shopName;
		position.shopLink = positionEdited.shopLink;
		position.characteristics = positionEdited.characteristics;

		const activeReceiptErr = activeReceipt.validateSync();
		const positionErr = position.validateSync();

		if (activeReceiptErr) return next({ code: activeReceiptErr.errors ? 5 : 2, err: activeReceiptErr });
		if (positionErr) return next({ code: positionErr.errors ? 5 : 2, err: positionErr });

		await Promise.all([activeReceipt.save(), position.save()]);

		Studio.findByIdAndUpdate(
			position.studio._id,
			{
				$set: {
					'stock.stockPrice':
						stockPriceOld +
						(activeReceipt.current.quantity * activeReceipt.unitPurchasePrice -
							activeReceiptOld.current.quantity * activeReceiptOld.unitPurchasePrice),
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		Position.findById(position._id)
			.populate({
				path: 'activeReceipt characteristics',
			})
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.then(position => res.json(position))
			.catch(err => next({ code: 2, err }));
	}
);

positionsRouter.post(
	'/positionReceiptAddQuantity',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { positionId },
			data: { comment, quantity: quantityAdded },
		} = req.body;

		const quantity = Number(quantityAdded);

		const position = await Position.findById(positionId)
			.populate({ path: 'studio', select: 'stock' })
			.populate('activeReceipt')
			.catch(err => next({ code: 2, err }));

		const {
			studio: {
				stock: { stockPrice: stockPriceOld },
			},
			activeReceipt,
		} = position;

		const activeReceiptCurrentSet = {
			quantity: activeReceipt.current.quantity + quantity,
		};

		if (position.unitReceipt === 'nmp' && position.unitIssue === 'pce') {
			activeReceiptCurrentSet.quantityPackages = (activeReceipt.current.quantity + quantity) / activeReceipt.quantityInUnit;
		}

		await Receipt.findByIdAndUpdate(
			activeReceipt._id,
			{
				$set: {
					current: activeReceiptCurrentSet,
				},
				$push: {
					additions: {
						quantity,
						comment,
					},
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		Studio.findByIdAndUpdate(
			position.studio._id,
			{
				$set: {
					'stock.stockPrice': stockPriceOld + quantity * activeReceipt.unitPurchasePrice,
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		Position.findById(position._id)
			.populate({
				path: 'activeReceipt characteristics',
			})
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.then(position => res.json(position))
			.catch(err => next({ code: 2, err }));
	}
);

positionsRouter.post(
	'/removePositionFromGroup',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { positionId },
		} = req.body;

		const position = await Position.findById(positionId)
			.populate('positionGroup')
			.catch(err => next({ code: 2, err }));

		Position.findByIdAndUpdate(position._id, {
			$set: { divided: true },
			$unset: { positionGroup: 1 },
		}).catch(err => next({ code: 2, err }));

		let remainingPositionId = null;

		if (position.positionGroup.positions.length > 2) {
			PositionGroup.findByIdAndUpdate(position.positionGroup._id, { $pull: { positions: position._id } }).catch(err =>
				next({ code: 2, err })
			);
		} else {
			remainingPositionId = position.positionGroup.positions.find(positionId => String(positionId) !== String(position._id));

			Position.findByIdAndUpdate(remainingPositionId, {
				$set: { divided: true },
				$unset: { positionGroup: 1 },
			}).catch(err => next({ code: 2, err }));

			PositionGroup.findByIdAndRemove(position.positionGroup._id).catch(err => next({ code: 2, err }));
		}

		res.json(remainingPositionId);
	}
);

positionsRouter.post(
	'/archivePosition',
	isAuthedResolver,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { positionId },
		} = req.body;

		const position = await Position.findById(positionId)
			.populate({ path: 'studio', select: 'stock' })
			.populate('positionGroup')
			.populate({
				path: 'receipts',
				match: { status: /received|active/ },
			})
			.catch(err => next({ code: 2, err }));

		// if (position.receipts.some(receipt => receipt.status === 'expected')) {
		// 	return res.json({
		// 		code: 400,
		// 		message: 'Позиция не может быть архивирована, пока есть поступление в одном из непоступивших заказов.',
		// 	});
		// }

		Position.findByIdAndUpdate(position._id, {
			$set: { isArchived: true, divided: true },
			$unset: { positionGroup: 1 },
		}).catch(err => next({ code: 2, err }));

		if (position.positionGroup) {
			if (position.positionGroup.positions.length > 2) {
				PositionGroup.findByIdAndUpdate(position.positionGroup._id, { $pull: { positions: position._id } }).catch(err =>
					next({ code: 2, err })
				);
			} else {
				const remainingPositionId = position.positionGroup.positions.find(positionId => String(positionId) !== String(position._id));

				Position.findByIdAndUpdate(remainingPositionId, {
					$set: { divided: true },
					$unset: { positionGroup: 1 },
				}).catch(err => next({ code: 2, err }));

				PositionGroup.findByIdAndRemove(position.positionGroup._id).catch(err => next({ code: 2, err }));
			}
		}

		const {
			studio: {
				stock: { numberPositions: numberPositionsOld, stockPrice: stockPriceOld },
			},
			receipts,
		} = position;

		const purchasePriceReceiptsPosition = receipts.reduce((sum, receipt) => {
			return sum + receipt.current.quantity * receipt.unitPurchasePrice;
		}, 0);

		Studio.findByIdAndUpdate(
			position.studio._id,
			{
				$set: {
					'stock.numberPositions': numberPositionsOld - 1,
					'stock.stockPrice': stockPriceOld - purchasePriceReceiptsPosition,
				},
			},
			{ runValidators: true }
		).catch(err => next({ code: 2, err }));

		res.json();
	}
);

export default positionsRouter;
