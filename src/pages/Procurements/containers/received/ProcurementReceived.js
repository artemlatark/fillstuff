import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClassNames from 'classnames';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';

import CardPaper from 'src/components/CardPaper';
import Money from 'src/components/Money';
import AvatarTitle from 'src/components/AvatarTitle';
import Tooltip from 'src/components/Tooltip';

import Receipt from './Receipt';

import { TableCell } from './styles';
import styles from './ProcurementReceived.module.css';

const ProcurementReceived = props => {
	const { procurement, filterParams } = props;
	const [expanded, setExpanded] = useState(filterParams.position !== 'all');

	const onHandleExpand = event => {
		if (!event.target.classList.contains(styles.title)) setExpanded(!expanded);
	};

	useEffect(() => {
		setExpanded(filterParams.position !== 'all');
	}, [filterParams.position]);

	return (
		<CardPaper className={styles.container} header={false}>
			<div className={styles.wrapper}>
				<div className={styles.header} onClick={onHandleExpand}>
					<Grid container>
						<Grid xs={6} item>
							<Link className={styles.title} to={`/procurements/${procurement._id}`}>
								{!procurement.noInvoice ? (
									<div>
										<span>№</span>
										{procurement.invoiceNumber} от {moment(procurement.invoiceDate).format('DD.MM.YYYY')}
									</div>
								) : (
									'Чек/накладная отсутствует'
								)}
							</Link>
							{!procurement.orderedByMember || procurement.orderedByMember._id === procurement.receivedByMember._id ? (
								<AvatarTitle imageSrc={procurement.receivedByMember.user.avatar} title={procurement.receivedByMember.user.name} />
							) : (
								<div>
									<Tooltip
										title={
											<div>
												<Typography variant="body2">
													<b>Заказал</b>
												</Typography>
												<Typography variant="body2" gutterBottom>
													{procurement.orderedByMember.user.name}
												</Typography>
												<Typography variant="body2">
													<b>Принял</b>
												</Typography>
												<Typography variant="body2">{procurement.receivedByMember.user.name}</Typography>
											</div>
										}
										placement="top-start"
										style={{ display: 'inline-block' }}
									>
										<div className={styles.users}>
											<AvatarTitle
												classNames={{
													container: styles.user,
												}}
												imageSrc={procurement.orderedByMember.user.avatar}
											/>
											<AvatarTitle
												classNames={{
													container: styles.user,
												}}
												imageSrc={procurement.receivedByMember.user.avatar}
											/>
										</div>
									</Tooltip>
								</div>
							)}
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
				</div>
				<Collapse in={expanded} timeout={300} unmountOnExit>
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
									<Receipt key={receipt._id} receipt={receipt} positionSameFilter={receipt.position._id === filterParams.position} />
								))}
							</TableBody>
						</Table>
					</div>
				</Collapse>
				<ButtonBase
					className={ClassNames({
						[styles.detailsButton]: true,
						open: expanded,
					})}
					onClick={onHandleExpand}
				>
					<FontAwesomeIcon icon={['far', 'angle-down']} className={expanded ? 'open' : ''} />
				</ButtonBase>
			</div>
		</CardPaper>
	);
};

export default ProcurementReceived;
