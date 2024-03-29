import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '@material-ui/core/Tooltip';

import { formatNumber } from 'shared/utils';

import NumberFormat, { currencyMoneyFormatProps } from 'src/components/NumberFormat';
import { DefinitionList, DefinitionListItem } from 'src/components/Definition';

import stylesPositions from '../containers/Positions.module.css';
import styles from './SellingPriceDisplay.module.css';

const SellingPriceDisplay = props => {
	const {
		position: { isFree, unitRelease, activeReceipt, receipts },
	} = props;

	if (isFree) return <span className={stylesPositions.caption}>Бесплатно</span>;

	const receiptsReceived = receipts.filter(receipt => receipt.status === 'received');
	const nextReceipt = receiptsReceived.length ? receiptsReceived[0] : null;

	if (!nextReceipt && !activeReceipt.unitCostDelivery && !activeReceipt.unitMarkup) {
		return (
			<NumberFormat
				value={formatNumber(activeReceipt.unitSellingPrice, { toString: true })}
				renderText={value => value}
				displayType="text"
				{...currencyMoneyFormatProps}
			/>
		);
	}

	return (
		<Tooltip
			title={
				<div style={{ width: 230 }}>
					<DefinitionList>
						<DefinitionListItem
							term="Цена покупки"
							value={
								<NumberFormat
									value={formatNumber(activeReceipt.unitPurchasePrice, { toString: true })}
									renderText={value => value}
									displayType="text"
									{...currencyMoneyFormatProps}
								/>
							}
						/>
						{activeReceipt.unitCostDelivery ? (
							<DefinitionListItem
								term="Стоимость доставки"
								value={
									<NumberFormat
										value={formatNumber(activeReceipt.unitCostDelivery, { toString: true })}
										renderText={value => value}
										displayType="text"
										{...currencyMoneyFormatProps}
									/>
								}
							/>
						) : null}
						{activeReceipt.unitMarkup ? (
							<DefinitionListItem
								term="Наценка"
								value={
									<NumberFormat
										value={formatNumber(activeReceipt.unitMarkup, { toString: true })}
										renderText={value => value}
										displayType="text"
										{...currencyMoneyFormatProps}
									/>
								}
							/>
						) : null}
					</DefinitionList>

					{nextReceipt ? (
						nextReceipt.unitSellingPrice > activeReceipt.unitSellingPrice ? (
							<div className={styles.tooltipInfo}>
								После списания{' '}
								<b>
									{activeReceipt.current.quantity}&nbsp;{unitRelease === 'pce' ? 'шт.' : 'уп.'}
								</b>{' '}
								цена продажи <span className={styles.changePriceUp}>повысится</span> до&nbsp;
								<b>{formatNumber(nextReceipt.unitSellingPrice, { toString: true })}&nbsp;₽</b>
							</div>
						) : nextReceipt.unitSellingPrice < activeReceipt.unitSellingPrice ? (
							<div className={styles.tooltipInfo}>
								После списания{' '}
								<b>
									{activeReceipt.current.quantity}&nbsp;{unitRelease === 'pce' ? 'шт.' : 'уп.'}
								</b>{' '}
								цена продажи <span className={styles.changePriceDown}>снизится</span> до&nbsp;
								<b>{formatNumber(nextReceipt.unitSellingPrice, { toString: true })}&nbsp;₽</b>
							</div>
						) : null
					) : null}
				</div>
			}
			placement="left"
			interactive
		>
			<span className={styles.tooltipContainer}>
				<NumberFormat
					value={formatNumber(activeReceipt.unitSellingPrice, { toString: true })}
					renderText={value => value}
					displayType="text"
					{...currencyMoneyFormatProps}
				/>
				{nextReceipt ? (
					nextReceipt.unitSellingPrice > activeReceipt.unitSellingPrice ? (
						<FontAwesomeIcon className={styles.changePriceIconUp} icon={['far', 'chevron-up']} fixedWidth />
					) : nextReceipt.unitSellingPrice < activeReceipt.unitSellingPrice ? (
						<FontAwesomeIcon className={styles.changePriceIconDown} icon={['far', 'chevron-down']} fixedWidth />
					) : null
				) : null}
			</span>
		</Tooltip>
	);
};

export default SellingPriceDisplay;
