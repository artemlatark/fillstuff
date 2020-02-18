import React from 'react';

import Grid from '@material-ui/core/Grid';

import CardPaper from 'src/components/CardPaper';

import styles from './Indicators.module.css';

const Indicators = props => {
	const { currentStudio } = props;

	return (
		<CardPaper header={false} style={{ marginBottom: 16 }}>
			<Grid container>
				<Grid item xs={6}>
					<Grid alignItems="flex-end" justify="flex-start" container>
						<div className={styles.title}>Количество позиций:</div>
						<div className={styles.content}>{currentStudio.stock.numberPositions}</div>
					</Grid>
				</Grid>
				<Grid item xs={6}>
					<Grid alignItems="flex-end" justify="flex-end" container>
						<div className={styles.title}>Стоимость склада:</div>
						<div className={styles.content}>{currentStudio.stock.stockPrice} ₽</div>
					</Grid>
				</Grid>
			</Grid>
		</CardPaper>
	);
};

export default Indicators;