import React from 'react';
import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import CardPaper from 'src/components/CardPaper';
import Money from 'src/components/Money';
import AvatarTitle from 'src/components/AvatarTitle';

import Receipt from './Receipt';

import { TableCell } from './styles';
import styles from './Procurement.module.css';

const Procurement = props => {
	const { procurement } = props;

	return (
		<CardPaper className={styles.container} header={false}>
			<div className={styles.wrapper}>
				<Grid className={styles.header} container>
					<Grid xs={6} item>
						<div className={styles.title}>
							{!procurement.noInvoice ? (
								<div>
									<span>№</span>
									{procurement.number} от {moment(procurement.date).format('DD.MM.YYYY')}
								</div>
							) : (
								'Чек/накладная отсутствует'
							)}
						</div>
						<AvatarTitle imageSrc={procurement.member.user.avatar} title={procurement.member.user.name} />
					</Grid>
					<Grid xs={6} item>
						<div className={styles.indicatorsTitle}>
							<Money value={procurement.totalPrice} />
						</div>
						<Grid className={styles.indicatorsDetails} justify="flex-end" container>
							<div>
								<div className={styles.indicatorsSubtitle2}>
									<Money value={procurement.costDelivery} />
								</div>
								<div className={styles.indicatorsSubtitle}>Доставка</div>
							</div>
							<div style={{ marginLeft: 30 }}>
								<div className={styles.indicatorsSubtitle2}>
									<Money value={procurement.pricePositions} />
								</div>
								<div className={styles.indicatorsSubtitle}>Позиции</div>
							</div>
						</Grid>
					</Grid>
				</Grid>
				<div className={styles.receipts}>
					<Table style={{ tableLayout: 'fixed' }}>
						<TableHead>
							<TableRow>
								<TableCell width={280}>Позиция</TableCell>
								<TableCell />
								<TableCell align="right" width={160}>
									Поступило
								</TableCell>
								<TableCell align="right" width={140}>
									Цена
								</TableCell>
								<TableCell align="right" width={140}>
									Сумма
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{procurement.receipts.map((receipt, index) => (
								<Receipt key={index} receipt={receipt} />
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</CardPaper>
	);
};

export default Procurement;