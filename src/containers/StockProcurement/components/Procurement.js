import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar';

import { history } from 'src/helpers/history';

import NumberFormat, { currencyFormatProps } from 'src/components/NumberFormat';
import CardPaper from 'src/components/CardPaper';
import QuantityIndicator from 'src/components/QuantityIndicator';

import { getProcurement } from 'src/actions/procurements';

import { TableCell } from './styles';
import styles from './Procurement.module.css';

class Procurement extends Component {
	state = {
		procurementData: null,
	};

	componentDidMount() {
		const { currentUser } = this.props;

		this.props.getProcurement().then(response => {
			if (response.status === 'success') {
				this.setState({
					procurementData: response,
					newComment: response.data.comment,
				});
			} else {
				history.push({
					pathname: `/stocks/${currentUser.activeStockId}/procurements`,
				});
			}
		});
	}

	render() {
		const { procurementData } = this.state;

		if (!procurementData) return <div children={<CircularProgress size={20} />} style={{ textAlign: 'center' }} />;

		const { data: procurement } = procurementData;

		if (procurementData)
			return (
				<CardPaper className={styles.procurement} header={false}>
					<div className={styles.procurementWrapper}>
						<Grid className={styles.procurementHeader} container>
							<Grid xs={6} item>
								<div className={styles.procurementNumber}>
									№{procurement.number} от {moment(procurement.date).format('DD.MM.YYYY')}
								</div>
								<div className={styles.procurementUser}>
									<Avatar
										className={styles.procurementUserPhoto}
										src={procurement.user.profilePhoto}
										alt={procurement.user.name}
										children={<div className={styles.procurementUserIcon} children={<FontAwesomeIcon icon={['fas', 'user-alt']} />} />}
									/>
									<Grid alignItems="flex-end" container>
										<div className={styles.procurementUserName}>{procurement.user.name}</div>
									</Grid>
								</div>
							</Grid>
							<Grid xs={6} item>
								<Grid alignItems="flex-end" justify="flex-start" direction="column" container>
									<NumberFormat
										value={procurement.totalPurchasePrice}
										renderText={value => (
											<div className={styles.procurementTotalPurchasePrice}>
												Итого: <span>{value}</span>
											</div>
										)}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
									<NumberFormat
										value={procurement.purchasePrice}
										renderText={value => (
											<div className={styles.procurementPurchasePrice}>
												Стоимость позиций: <span>{value}</span>
											</div>
										)}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
									<NumberFormat
										value={procurement.costDelivery}
										renderText={value => (
											<div className={styles.procurementCostDelivery}>
												Стоимость доставки: <span>{value}</span>
											</div>
										)}
										displayType="text"
										onValueChange={() => {}}
										{...currencyFormatProps}
									/>
								</Grid>
							</Grid>
						</Grid>
						<div className={styles.procurementReceipts}>
							<div className={styles.procurementDetails}>Детали закупки</div>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Наименование</TableCell>
										<TableCell align="right" width={160}>
											Количество
										</TableCell>
										<TableCell align="right" width={160}>
											Цена покупки
										</TableCell>
										<TableCell align="right" width={160}>
											Цена продажи
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{procurement.receipts.map((receipt, index) => (
										<TableRow key={index}>
											<TableCell>
												{receipt.position.name}{' '}
												{receipt.position.characteristics.reduce(
													(fullCharacteristics, characteristic) => `${fullCharacteristics} ${characteristic.label}`,
													''
												)}
												{receipt.position.isArchived ? <span className={styles.isArchived}>В архиве</span> : null}
											</TableCell>
											<TableCell align="right" width={160}>
												<QuantityIndicator
													type="receipt"
													unitReceipt={receipt.position.unitReceipt}
													unitIssue={receipt.position.unitIssue}
													receipts={[{ ...receipt.initial }]}
												/>
											</TableCell>
											<TableCell align="right" width={160}>
												{receipt.unitPurchasePrice} ₽
											</TableCell>
											<TableCell align="right" width={160}>
												{!receipt.position.isFree ? `${receipt.unitSellingPrice} ₽` : 'Бесплатно'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</CardPaper>
			);
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	const { currentStock, procurementId } = ownProps;

	return {
		getProcurement: () => dispatch(getProcurement(currentStock._id, procurementId)),
	};
};

export default connect(null, mapDispatchToProps)(Procurement);
