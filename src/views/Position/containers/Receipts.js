import React, { useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';

import CardPaper from 'src/components/CardPaper';

import Receipt from './Receipt';

import { TableCell } from '../components/styles';

const Receipts = props => {
	const { position, receiptsData, onOpenDialogReceipt, onChangeSellingPriceReceipt } = props;
	const [showReceipts, setShowReceipts] = useState(5);

	const onShowReceipts = length => setShowReceipts(length);

	return (
		<CardPaper
			leftContent="Поступления"
			rightContent={
				!position.receipts.length ? (
					<Button
						onClick={() => onOpenDialogReceipt('dialogReceiptConfirmCreate', 'position', position)}
						variant="outlined"
						color="primary"
						size="small"
					>
						Создать поступление
					</Button>
				) : null
			}
			style={{ marginTop: 16 }}
			title
		>
			{receiptsData && receiptsData.status === 'success' && receiptsData.data.length ? (
				<>
					<Table style={{ tableLayout: 'fixed', margin: '-20px -15px', width: 'calc(100% + 30px)' }}>
						<TableHead>
							<TableRow>
								<TableCell>Дата поступления</TableCell>
								<TableCell>Статус</TableCell>
								<TableCell align="right" width={200}>
									В наличии / Поступило
								</TableCell>
								<TableCell align="right" width={140}>
									Цена покупки
								</TableCell>
								<TableCell align="right" width={140}>
									Цена продажи
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{receiptsData.data.map((receipt, index) => {
								if (index + 1 > showReceipts) return null;

								return (
									<Receipt
										key={receipt._id}
										position={position}
										receipt={receipt}
										onChangeSellingPriceReceipt={onChangeSellingPriceReceipt}
									/>
								);
							})}
						</TableBody>
					</Table>
					{receiptsData.data.length > showReceipts ? (
						<Grid justifyContent="center" container>
							<Button onClick={() => onShowReceipts(receiptsData.data.length)} variant="outlined" style={{ marginTop: 25 }}>
								Показать все поступления
							</Button>
						</Grid>
					) : null}
				</>
			) : receiptsData && receiptsData.status === 'success' && !receiptsData.data.length ? (
				<Typography style={{ padding: '2px 0' }}>Еще нет ни одного поступления</Typography>
			) : receiptsData && receiptsData.status === 'error' ? (
				<Typography style={{ padding: '2px 0' }}>Не удалось загрузить поступления</Typography>
			) : !receiptsData ? (
				<div children={<CircularProgress size={20} />} style={{ textAlign: 'center' }} />
			) : null}
		</CardPaper>
	);
};

export default Receipts;
