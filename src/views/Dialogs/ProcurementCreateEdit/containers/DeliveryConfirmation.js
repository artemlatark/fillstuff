import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';

import DeliveryDate from '../components/DeliveryDate';
import CostDelivery from '../components/CostDelivery';
import Comment from '../components/Comment';

const styles = () => ({
	container: {
		paddingBottom: 40,
	},
	title: {
		marginBottom: 20,
	},
	formRow: {
		'&:not(:last-child)': {
			marginBottom: 20,
		},
	},
	label: {
		width: 150,
	},
});

function DeliveryConfirmation({ classes, formikProps, formikProps: { touched, errors } }) {
	return (
		<DialogContent className={classes.container} style={{ overflow: 'initial' }}>
			<Typography className={classes.title} variant="h5" align="center">
				Данные о доставке
			</Typography>

			<Grid className={classes.formRow} wrap="nowrap" alignItems="flex-start" container>
				<InputLabel className={classes.label} error={touched.deliveryDate && Boolean(errors.deliveryDate)} data-inline>
					Дата доставки
				</InputLabel>
				<DeliveryDate formikProps={formikProps} />
			</Grid>

			<Grid className={classes.formRow} wrap="nowrap" alignItems="flex-start" container>
				<InputLabel className={classes.label} error={touched.costDelivery && Boolean(errors.costDelivery)} data-inline>
					Стоимость доставки
				</InputLabel>
				<CostDelivery formikProps={formikProps} />
			</Grid>

			<Grid className={classes.formRow} wrap="nowrap" alignItems="flex-start" container>
				<InputLabel className={classes.label} error={touched.comment && Boolean(errors.comment)} data-inline>
					Комментарий
				</InputLabel>
				<Comment formikProps={formikProps} />
			</Grid>
		</DialogContent>
	);
}

export default withStyles(styles)(DeliveryConfirmation);
