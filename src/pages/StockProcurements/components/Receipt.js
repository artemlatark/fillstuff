import React from 'react';

import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import { formatNumber } from 'shared/utils';

import NumberFormat, { currencyFormatProps } from 'src/components/NumberFormat';
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
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}}>
				<PositionNameInList
					name={receipt.position.name}
					characteristics={receipt.position.characteristics}
					isArchived={receipt.position.isArchived}
				/>
			</TableCell>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={160}>
				<QuantityIndicator
					type="receipt"
					unitReceipt={receipt.position.unitReceipt}
					unitIssue={receipt.position.unitIssue}
					receipts={[{ ...receipt.initial }]}
				/>
			</TableCell>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={160}>
				{formatNumber(receipt.unitPurchasePrice, { toString: true })} ₽
			</TableCell>
			<TableCell classes={positionSameFilter ? { root: TableCellHighlightClasses.root } : {}} align="right" width={160}>
				{!receipt.position.isFree ? (
					<Tooltip
						title={
							<div>
								<NumberFormat
									value={formatNumber(receipt.unitPurchasePrice, { toString: true })}
									renderText={value => `Цена покупки: ${value}`}
									displayType="text"
									onValueChange={() => {}}
									{...currencyFormatProps}
								/>
								{receipt.unitCostDelivery > 0 ? <br /> : null}
								{receipt.unitCostDelivery > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitCostDelivery, { toString: true })}
										renderText={value => `Стоимость доставки: ${value}`}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
								) : null}
								{receipt.unitExtraCharge > 0 ? <br /> : null}
								{receipt.unitExtraCharge > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitExtraCharge, { toString: true })}
										renderText={value => `Процент студии: ${value}`}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
								) : null}
								{receipt.unitManualExtraCharge > 0 ? <br /> : null}
								{receipt.unitManualExtraCharge > 0 ? (
									<NumberFormat
										value={formatNumber(receipt.unitManualExtraCharge, { toString: true })}
										renderText={value => `Ручная наценка: ${value}`}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
								) : null}
							</div>
						}
					>
						<span>{formatNumber(receipt.unitSellingPrice, { toString: true })} ₽</span>
					</Tooltip>
				) : (
					<span className={styles.caption}>Бесплатно</span>
				)}
			</TableCell>
		</TableRow>
	);
};

export default Receipt;