import React from 'react';

import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import { formatNumber } from 'shared/utils';

import NumberFormat, { currencyMoneyFormatProps } from 'src/components/NumberFormat';
import PositionNameInList from 'src/components/PositionNameInList';
import QuantityIndicator from 'src/components/QuantityIndicator';

import styles from './Procurement.module.css';

import { TableCell, TableCellHighlight, TableRowHighlight } from './styles';

const Receipt = props => {
	const { receipt, positionSameFilter } = props;
	const TableRowHighlightClasses = TableRowHighlight();
	const TableCellHighlightClasses = TableCellHighlight();

	return (
		<TableRow classes={positionSameFilter ? { root: TableRowHighlightClasses.root } : {}}>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} width={280}>
				<PositionNameInList
					name={receipt.position.name}
					characteristics={receipt.position.characteristics}
					isArchived={receipt.position.isArchived}
				/>
			</TableCell>
			<TableCell />
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={160}>
				<QuantityIndicator
					type="receipt"
					unitReceipt={receipt.position.unitReceipt}
					unitRelease={receipt.position.unitRelease}
					receipts={[{ ...receipt.initial }]}
				/>
			</TableCell>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={140}>
				<NumberFormat
					value={formatNumber(receipt.unitPurchasePrice, { toString: true })}
					renderText={value => value}
					displayType="text"
					{...currencyMoneyFormatProps}
				/>
			</TableCell>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={140}>
				{!receipt.position.isFree ? (
					<Tooltip
						title={
							<div>
								<NumberFormat
									value={formatNumber(receipt.unitPurchasePrice, { toString: true })}
									renderText={value => `Цена покупки: ${value}`}
									displayType="text"
									{...currencyMoneyFormatProps}
								/>
								{receipt.unitCostDelivery > 0 ? <br /> : null}
								{receipt.unitCostDelivery > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitCostDelivery, { toString: true })}
										renderText={value => `Стоимость доставки: ${value}`}
										displayType="text"
										{...currencyMoneyFormatProps}
									/>
								) : null}
								{receipt.unitMarkup > 0 ? <br /> : null}
								{receipt.unitMarkup > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitMarkup, { toString: true })}
										renderText={value => `Наценка: ${value}`}
										displayType="text"
										{...currencyMoneyFormatProps}
									/>
								) : null}
								{receipt.unitManualMarkup > 0 ? <br /> : null}
								{receipt.unitManualMarkup > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitManualMarkup, { toString: true })}
										renderText={value => `Ручная наценка: ${value}`}
										displayType="text"
										{...currencyMoneyFormatProps}
									/>
								) : null}
							</div>
						}
					>
						<span>
							<NumberFormat
								value={formatNumber(receipt.unitSellingPrice, { toString: true })}
								renderText={value => value}
								displayType="text"
								{...currencyMoneyFormatProps}
							/>
						</span>
					</Tooltip>
				) : (
					<span className={styles.caption}>Бесплатно</span>
				)}
			</TableCell>
		</TableRow>
	);
};

export default Receipt;
