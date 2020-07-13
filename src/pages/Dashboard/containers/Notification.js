import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ClassNames from 'classnames';
import moment from 'moment';

import { getDeliveryDateTimeMoment } from 'src/helpers/utils';

import CardPaper from 'src/components/CardPaper';

import { editStatusDeliveryIsExpected } from 'src/actions/storeNotifications';

import PositionEnds from '../components/notificationsContent/PositionEnds';
import DeliveryIsExpected from '../components/notificationsContent/DeliveryIsExpected';
import MemberInvoice from '../components/notificationsContent/MemberInvoice';

import styles from './Notification.module.css';

const Notification = props => {
	const { index, reverseIndex, importance, onOpenDialogByName, notification } = props;
	const [actionStatus, setActionStatus] = useState(false);

	const containerClasses = ClassNames({
		[styles.card]: true,
		[styles.cardImportanceRed]: importance === 'red',
		[styles.cardImportanceOrange]: importance === 'orange',
		[styles.cardImportanceGreen]: importance === 'green',
		[styles.cardNew]: notification.actionStatus === 'new',
		[styles.cardDeleting]: actionStatus === 'deleting' || notification.actionStatus === 'deleting',
		[styles.cardPositionEnds]: notification.type === 'position-ends',
		[styles.cardDeliveryIsExpected]: notification.type === 'delivery-is-expected',
		[styles.cardMemberInvoice]: notification.type === 'member-invoice',
	});

	const openViewDialog = event => {
		if (
			(event.target.closest('.' + styles.actionButton) &&
				event.target.closest('.' + styles.actionButton).classList.contains(styles.actionButton)) ||
			event.target.closest('[role="tooltip"]') ||
			(event.target.closest('.' + styles.procurementComment) &&
				event.target.closest('.' + styles.procurementComment).classList.contains(styles.procurementComment))
		)
			return;

		switch (notification.type) {
			case 'position-ends':
				return onOpenDialogByName('dialogPositionEnded', 'storeNotification', notification);
			case 'delivery-is-expected':
				return onOpenDialogByName('dialogProcurementExpectedView', 'procurementExpected', notification.procurement);
			default:
				return;
		}
	};

	useEffect(() => {
		if (notification.type === 'delivery-is-expected') {
			const { procurement } = notification;

			if (procurement.isConfirmed && !procurement.isUnknownDeliveryDate) {
				const momentDate = moment();

				let interval;
				const deliveryDateTo = getDeliveryDateTimeMoment(procurement.deliveryDate, procurement.deliveryTimeTo, 'to');

				if (momentDate.isSameOrBefore(deliveryDateTo)) {
					interval = setInterval(() => {
						if (moment().isSameOrAfter(deliveryDateTo)) {
							setActionStatus('deleting');
							clearInterval(interval);

							props.editStatusDeliveryIsExpected(notification);
						}
					}, 5000);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<CardPaper
			className={containerClasses}
			onClick={openViewDialog}
			header={false}
			elevation={1}
			style={{ zIndex: reverseIndex, '--cardIndex': index, '--cardReverseIndex': reverseIndex }}
		>
			{notification.type === 'position-ends' ? (
				<PositionEnds notification={notification} importance={importance} />
			) : notification.type === 'delivery-is-expected' ? (
				<DeliveryIsExpected notification={notification} importance={importance} onOpenDialogByName={onOpenDialogByName} />
			) : notification.type === 'member-invoice' ? (
				<MemberInvoice notification={notification} importance={importance} onOpenDialogByName={onOpenDialogByName} />
			) : null}
		</CardPaper>
	);
};

const mapDispatchToProps = dispatch => {
	return {
		editStatusDeliveryIsExpected: data => dispatch(editStatusDeliveryIsExpected({ data })),
	};
};

export default connect(null, mapDispatchToProps)(Notification);
