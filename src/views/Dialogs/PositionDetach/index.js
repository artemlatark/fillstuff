import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { Dialog, DialogTitle } from 'src/components/Dialog';

import { getStudioStore } from 'src/actions/studios';
import { detachPositions } from 'src/actions/positions';
import { enqueueSnackbar } from 'src/actions/snackbars';

const PositionDetach = props => {
	const { dialogOpen, onCloseDialog, onExitedDialog, onCallback, selectedPosition } = props;

	if (!selectedPosition) return null;

	const onDetachPositions = () => {
		props.detachPositions(selectedPosition._id).then(response => {
			if (onCallback !== undefined) onCallback(response);

			onCloseDialog();

			if (response.status === 'success') {
				props.enqueueSnackbar({
					message: (
						<div>
							Позиция <b>{selectedPosition.name}</b> разъединена.
							<br />У позиции изменился QR-код, распечатайте его.
						</div>
					),
					options: {
						variant: 'success',
					},
				});
			}

			if (response.status === 'error') {
				props.enqueueSnackbar({
					message: response.message || 'Неизвестная ошибка.',
					options: {
						variant: 'error',
					},
				});
			}
		});
	};

	return (
		<Dialog open={dialogOpen} onClose={onCloseDialog} TransitionProps={{ onExited: onExitedDialog }} maxWidth="sm">
			<DialogTitle onClose={onCloseDialog} theme="noTheme">
				Разъединение позиций
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					Вы действительно хотите разъединить позицию <b>{selectedPosition.name}</b>?
				</Typography>
				<DialogActions>
					<Button onClick={onCloseDialog} variant="outlined" size="small">
						Отмена
					</Button>
					<Button onClick={onDetachPositions} variant="contained" color="primary" size="small">
						Разъединить
					</Button>
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
};

PositionDetach.propTypes = {
	dialogOpen: PropTypes.bool.isRequired,
	onCloseDialog: PropTypes.func.isRequired,
	onExitedDialog: PropTypes.func,
	onCallback: PropTypes.func,
	selectedPosition: PropTypes.object,
};

const mapDispatchToProps = (dispatch, ownProps) => {
	const { selectedPosition } = ownProps;

	return {
		getStudioStore: () => dispatch(getStudioStore()),
		detachPositions: positionId => dispatch(detachPositions({ params: { positionId: selectedPosition._id } })),
		enqueueSnackbar: (...args) => dispatch(enqueueSnackbar(...args)),
	};
};

export default connect(null, mapDispatchToProps)(PositionDetach);
