import { Router } from 'express';

import { isAuthed, hasPermissions } from 'api/utils/permissions';
import Emitter from 'api/utils/emitter';

import User from 'api/models/user';
import Member from 'api/models/member';
import StoreNotification from 'api/models/storeNotification';

const router = Router();

// const debug = require('debug')('api:studio');

router.post(
	'/getStoreNotifications',
	isAuthed,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	(req, res, next) => {
		const { studioId } = req.body;

		StoreNotification.find({ studio: studioId })
			.sort({ createdAt: -1 })
			.populate([
				{
					path: 'position',
					populate: [
						{
							path: 'characteristics',
						},
						{
							path: 'parentPosition',
							populate: {
								path: 'characteristics',
							},
						},
						{
							path: 'receipts',
							match: { status: /received|active/ },
							options: {
								sort: { createdAt: 1 },
							},
						},
					],
				},
				{
					path: 'procurement',
					populate: [
						{
							path: 'orderedByMember',
							select: 'user',
							model: Member,
							populate: {
								path: 'user',
								model: User,
								select: 'picture name email',
							},
						},
						{
							path: 'orderedReceiptsPositions.position',
							populate: [
								{
									path: 'childPosition',
									select: 'name characteristics',
									populate: {
										path: 'characteristics',
									},
								},
								{
									path: 'parentPosition',
									select: 'name characteristics',
									populate: {
										path: 'characteristics',
									},
								},
								{
									path: 'characteristics',
								},
							],
						},
						{
							path: 'shop',
						},
					],
				},
				{
					path: 'invoice',
					populate: [
						{
							path: 'member',
							model: Member,
							populate: {
								path: 'user',
								model: User,
								select: 'picture name email',
							},
						},
					],
				},
				{
					path: 'writeOff',
				},
			])
			.then(storeNotifications => res.json(storeNotifications))
			.catch(err => next(err));
	}
);

router.post(
	'/getStoreNotification',
	isAuthed,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			params: { storeNotificationId },
		} = req.body;

		const storeNotification = await StoreNotification.findById(storeNotificationId)
			.populate([
				{
					path: 'position',
					populate: [
						{
							path: 'characteristics',
						},
						{
							path: 'parentPosition',
							populate: {
								path: 'characteristics',
							},
						},
						{
							path: 'characteristics shops.shop shops.lastProcurement receipts',
						},
					],
				},
				{
					path: 'procurement',
					populate: [
						{
							path: 'orderedByMember',
							select: 'user',
							model: Member,
							populate: {
								path: 'user',
								model: User,
								select: 'picture name email',
							},
						},
						{
							path: 'orderedReceiptsPositions.position',
							populate: [
								{
									path: 'childPosition',
									select: 'name characteristics',
									populate: {
										path: 'characteristics',
									},
								},
								{
									path: 'parentPosition',
									select: 'name characteristics',
									populate: {
										path: 'characteristics',
									},
								},
								{
									path: 'characteristics',
								},
							],
						},
						{
							path: 'shop',
						},
					],
				},
				{
					path: 'invoice',
					populate: [
						{
							path: 'member',
							model: Member,
							populate: {
								path: 'user',
								model: User,
								select: 'picture name email',
							},
						},
					],
				},
				{
					path: 'writeOff',
				},
			])
			.lean()
			.catch(err => next(err));

		if (storeNotification.type === 'position-ends') {
			storeNotification.position.shops = storeNotification.position.shops.map(shop => {
				if (shop.lastProcurement) {
					shop.lastProcurement.receipt = storeNotification.position.receipts.find(
						receipt =>
							String(receipt._id) === String(shop.lastProcurement.receipts.find(receiptId => String(receiptId) === String(receipt._id)))
					);
					delete shop.lastProcurement.receipts;
				}

				return shop;
			});

			storeNotification.position.receipts = storeNotification.position.receipts.filter(receipt => /received|active/.test(receipt.status));
		}

		res.json(storeNotification);
	}
);

router.post(
	'/deleteStoreNotification',
	isAuthed,
	(req, res, next) => hasPermissions(req, res, next, ['products.control']),
	async (req, res, next) => {
		const {
			studioId,
			params: { storeNotificationId },
		} = req.body;

		const storeNotification = await StoreNotification.findById(storeNotificationId);

		if (!/^(position-moved-archive)$/.test(storeNotification.type)) {
			return next({
				code: 7,
				message: 'Данный тип событий не может быть отменен',
			});
		}

		Emitter.emit('deleteStoreNotification', {
			studio: studioId,
			_id: storeNotificationId,
		});

		res.json();
	}
);

export default router;
