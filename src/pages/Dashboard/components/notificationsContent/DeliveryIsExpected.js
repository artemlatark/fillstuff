import React, { Fragment, useRef, useState } from 'react';
import moment from 'moment';
import ClassNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';

import { getDeliveryDateTimeMoment } from 'src/helpers/utils';

import Money from 'src/components/Money';
import Tooltip from 'src/components/Tooltip';
import Dropdown from 'src/components/Dropdown';
import MenuItem from 'src/components/MenuItem';

import styles from '../../containers/Notification.module.css';

const calendarFormat = {
	sameDay: 'Сегодня',
	nextDay: 'Завтра',
	lastDay: 'Вчера',
	sameElse: function(now) {
		return this.isSame(now, 'year') ? 'D MMMM' : 'D MMMM YYYY';
	},
	nextWeek: function(now) {
		return this.isSame(now, 'year') ? 'D MMMM' : 'D MMMM YYYY';
	},
	lastWeek: function(now) {
		return this.isSame(now, 'year') ? 'D MMMM' : 'D MMMM YYYY';
	},
};

const DeliveryIsExpected = props => {
	const {
		notification: { procurement },
		onOpenDialogByName,
	} = props;
	const refDropdownActions = useRef(null);
	const [dropdownActions, setDropdownActions] = useState(false);

	const onHandleDropdownActions = value => setDropdownActions(value === null || value === undefined ? prevValue => !prevValue : value);

	const deliveryDateToExpired = moment().isAfter(getDeliveryDateTimeMoment(procurement.deliveryDate, procurement.deliveryTimeTo, 'to'));

	const eventStatus = procurement.isConfirmed
		? !procurement.isUnknownDeliveryDate && deliveryDateToExpired
			? 'expired'
			: 'expected'
		: 'unconfirmed';

	return (
		<Fragment>
			<IconButton
				ref={refDropdownActions}
				className={ClassNames({
					[styles.actionButton]: true,
					[styles.actionButtonActive]: dropdownActions,
				})}
				onClick={() => onHandleDropdownActions()}
				size="small"
			>
				<FontAwesomeIcon icon={['far', 'ellipsis-v']} />
			</IconButton>
			<div className={styles.header}>
				{eventStatus === 'expected' ? (
					<FontAwesomeIcon className={styles.notificationIcon} icon={['fal', 'truck']} />
				) : eventStatus === 'unconfirmed' ? (
					<span className={`${styles.notificationIcon} fa-layers fa-fw`} style={{ width: '30px' }}>
						<FontAwesomeIcon icon={['fal', 'truck']} transform="right-1" />
						<FontAwesomeIcon icon={['fas', 'circle']} transform="shrink-5 up-4 left-6.5" inverse />
						<FontAwesomeIcon icon={['fas', 'question-circle']} transform="shrink-7 up-4 left-6.5" />
					</span>
				) : (
					<span className={`${styles.notificationIcon} fa-layers fa-fw`} style={{ width: '30px' }}>
						<FontAwesomeIcon icon={['fal', 'truck']} transform="right-1" />
						<FontAwesomeIcon icon={['fas', 'circle']} transform="shrink-5 up-4 left-6.5" inverse />
						<FontAwesomeIcon icon={['fas', 'exclamation-circle']} transform="shrink-7 up-4 left-6.5" />
					</span>
				)}
				<Typography className={styles.title} variant="h6">
					{eventStatus === 'expected'
						? 'Ожидается доставка'
						: eventStatus === 'unconfirmed'
						? 'Ожидается подтверждение заказа'
						: 'Доставка просрочена'}
				</Typography>
			</div>
			{procurement.isConfirmed ? (
				!procurement.isUnknownDeliveryDate ? (
					<Typography className={styles.subtitle} variant="subtitle1">
						{moment(procurement.deliveryDate).calendar(null, calendarFormat)}{' '}
						{procurement.deliveryTimeFrom && procurement.deliveryTimeTo
							? procurement.deliveryTimeFrom !== procurement.deliveryTimeTo
								? `с ${procurement.deliveryTimeFrom} до ${procurement.deliveryTimeTo}`
								: `в ${procurement.deliveryTimeFrom}`
							: null}
					</Typography>
				) : (
					<Typography className={styles.subtitle} variant="subtitle1">
						Дата доставки не известна
					</Typography>
				)
			) : null}
			<div>
				<div className={styles.totalPrice}>
					<Money value={procurement.totalPrice} />
				</div>
				<div className={styles.info}>
					<div className={styles.infoItem}>{procurement.shop.name}</div>
					{procurement.comment ? (
						<Fragment>
							<div className={styles.infoItem}>&nbsp;</div>
							<Tooltip title={procurement.comment} className={styles.procurementComment} placement="bottom" leaveDelay={500} interactive>
								<FontAwesomeIcon icon={['fal', 'comment']} />
							</Tooltip>
						</Fragment>
					) : null}
				</div>
			</div>

			<Dropdown
				anchor={refDropdownActions}
				open={dropdownActions}
				onClose={() => onHandleDropdownActions(false)}
				placement="bottom-end"
				disablePortal={true}
			>
				<MenuList>
					{procurement.isConfirmed ? (
						<MenuItem
							onClick={() => {
								onHandleDropdownActions();
								onOpenDialogByName('dialogProcurementReceivedCreate', 'procurementReceived', procurement);
							}}
							iconBefore={<FontAwesomeIcon icon={['far', 'truck-loading']} />}
						>
							Оформить закупку
						</MenuItem>
					) : (
						<MenuItem
							onClick={() => {
								onHandleDropdownActions();
								onOpenDialogByName('dialogProcurementExpectedConfirm', 'procurementExpected', procurement);
							}}
							iconBefore={
								<span className="fa-layers fa-fw" style={{ width: '16px' }}>
									<FontAwesomeIcon icon={['far', 'truck']} />
									<FontAwesomeIcon icon={['fas', 'circle']} transform="shrink-5 up-4 left-6" inverse />
									<FontAwesomeIcon icon={['fas', 'check-circle']} transform="shrink-7 up-4 left-6" />
								</span>
							}
						>
							Подтвердить заказ
						</MenuItem>
					)}
					{procurement.isConfirmed ? (
						<MenuItem
							onClick={() => {
								onHandleDropdownActions();
								onOpenDialogByName('dialogProcurementExpectedEdit', 'procurementExpected', procurement);
							}}
							iconBefore={<FontAwesomeIcon icon={['far', 'pen']} />}
						>
							Редактировать
						</MenuItem>
					) : null}
					<MenuItem
						onClick={() => {
							onHandleDropdownActions();
							onOpenDialogByName('dialogProcurementExpectedCancel', 'procurementExpected', procurement);
						}}
						iconBefore={<FontAwesomeIcon icon={['far', 'undo']} />}
						destructive
					>
						Отменить заказ
					</MenuItem>
				</MenuList>
			</Dropdown>
		</Fragment>
	);
};

export default DeliveryIsExpected;