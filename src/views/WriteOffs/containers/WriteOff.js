import React from 'react';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import { formatNumber } from 'shared/utils';

import NumberFormat, { currencyMoneyFormatProps } from 'src/components/NumberFormat';
import PositionSummary from 'src/components/PositionSummary';
import UserSummary from 'src/components/UserSummary';

import styles from './WriteOff.module.css';

import { TableCell } from '../components/styles';

const WriteOff = props => {
	const { writeOff, isCurrentDay, onOpenDialogWriteOff } = props;

	const createdAtMoment = moment(writeOff.createdAt);
	const isCurrentDayWriteOff = moment()
		.subtract({ day: 1 })
		.isBefore(writeOff.createdAt);
	const isCurrentHour = moment()
		.subtract({ hour: 1 })
		.isBefore(writeOff.createdAt);
	const isNow = moment()
		.subtract({ minute: 1 })
		.isBefore(writeOff.createdAt);

	const positionBadges = (badges = []) => {
		if (writeOff.canceled) badges.push('canceled');

		return badges;
	};

	return (
		<TableRow className={styles.writeOff}>
			<TableCell width={100}>
				<UserSummary src={writeOff.member.user.picture} title={writeOff.member.user.name} />
			</TableCell>
			<TableCell>
				<PositionSummary
					name={writeOff.position.name}
					characteristics={writeOff.position.characteristics}
					badges={positionBadges()}
					avatar
				/>
			</TableCell>
			<TableCell align="right" width={115}>
				{writeOff.quantity} {writeOff.position.unitRelease === 'pce' ? 'шт.' : 'уп.'}
			</TableCell>
			<TableCell align="right" width={140}>
				{writeOff.quantity > 1 ? (
					<div className={styles.moneyContainer}>
						<NumberFormat
							value={formatNumber(writeOff.purchasePrice, { toString: true })}
							renderText={value => <span className={styles.moneyLarge}>{value}</span>}
							displayType="text"
							{...currencyMoneyFormatProps}
						/>
						<NumberFormat
							value={formatNumber(writeOff.unitPurchasePrice, { toString: true })}
							renderText={value => <span className={styles.moneySmall}>{value}</span>}
							displayType="text"
							{...currencyMoneyFormatProps}
						/>
					</div>
				) : (
					<NumberFormat
						value={formatNumber(writeOff.purchasePrice, { toString: true })}
						renderText={value => <span className={styles.moneyLarge}>{value}</span>}
						displayType="text"
						{...currencyMoneyFormatProps}
					/>
				)}
			</TableCell>
			<TableCell align="right" width={140}>
				{!writeOff.isFree ? (
					writeOff.quantity > 1 ? (
						<div className={styles.moneyContainer}>
							<NumberFormat
								value={formatNumber(writeOff.sellingPrice, { toString: true })}
								renderText={value => <span className={styles.moneyLarge}>{value}</span>}
								displayType="text"
								{...currencyMoneyFormatProps}
							/>
							<NumberFormat
								value={formatNumber(writeOff.unitSellingPrice, { toString: true })}
								renderText={value => <span className={styles.moneySmall}>{value}</span>}
								displayType="text"
								{...currencyMoneyFormatProps}
							/>
						</div>
					) : (
						<NumberFormat
							value={formatNumber(writeOff.sellingPrice, { toString: true })}
							renderText={value => <span className={styles.moneyLarge}>{value}</span>}
							displayType="text"
							{...currencyMoneyFormatProps}
						/>
					)
				) : (
					<span className={styles.caption}>Бесплатно</span>
				)}
			</TableCell>
			<TableCell align="right" width={160}>
				<Grid alignItems="center" justifyContent="flex-end" container>
					{!isCurrentHour ? createdAtMoment.format('HH:mm') : !isNow ? createdAtMoment.fromNow() : 'только что'}
				</Grid>
			</TableCell>
			{isCurrentDay ? (
				<TableCell width={50} style={{ padding: '0 7px' }}>
					{isCurrentDayWriteOff && !writeOff.canceled ? (
						<Tooltip title="Отменить списание" placement="top">
							<IconButton
								className={styles.cancelWriteOffButton}
								onClick={() => onOpenDialogWriteOff('dialogWriteOffCancel', 'writeOff', writeOff)}
							>
								<FontAwesomeIcon icon={['far', 'undo']} />
							</IconButton>
						</Tooltip>
					) : null}
				</TableCell>
			) : null}
		</TableRow>
	);
};

export default WriteOff;
