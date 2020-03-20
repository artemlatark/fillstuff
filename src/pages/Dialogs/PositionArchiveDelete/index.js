import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import { Dialog, DialogActions, DialogTitle } from 'src/components/Dialog';

import { getStudioStock } from 'src/actions/studio';
import { archivePosition } from 'src/actions/positions';

const PositionArchiveDelete = props => {
	const { dialogOpen, onCloseDialog, onExitedDialog, onCallback, selectedPosition } = props;

	if (!selectedPosition) return null;

	const type = selectedPosition.receipts.length ? 'archive' : 'delete';

	const onSubmit = () => {
		props.archivePosition(selectedPosition._id, selectedPosition.positionGroup).then(response => {
			if (onCallback !== undefined) onCallback(response);

			onCloseDialog();

			if (response.status === 'success') props.getStudioStock();
		});
	};

	return (
		<Dialog open={dialogOpen} onClose={onCloseDialog} onExited={onExitedDialog}>
			<DialogTitle onClose={onCloseDialog}>{type === 'archive' ? 'Архивирование' : 'Удаление'} позиции</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Вы действительно хотите {type === 'archive' ? 'архивировать' : 'удалить'} позицию{' '}
					<span>
						<b>
							{selectedPosition.characteristics.reduce(
								(fullCharacteristics, characteristic) => `${fullCharacteristics} ${characteristic.label}`,
								selectedPosition.name
							)}
						</b>
						?
					</span>
				</DialogContentText>
			</DialogContent>
			<DialogActions
				leftHandleProps={{
					handleProps: {
						onClick: onCloseDialog,
					},
					text: 'Отмена',
				}}
				rightHandleProps={{
					handleProps: {
						autoFocus: true,
						onClick: onSubmit,
					},
					text: type === 'archive' ? 'Архивировать' : 'Удалить',
				}}
			/>
		</Dialog>
	);
};

PositionArchiveDelete.propTypes = {
	dialogOpen: PropTypes.bool.isRequired,
	onCloseDialog: PropTypes.func.isRequired,
	onExitedDialog: PropTypes.func,
	onCallback: PropTypes.func,
	selectedPosition: PropTypes.object,
};

const mapDispatchToProps = dispatch => {
	return {
		getStudioStock: () => dispatch(getStudioStock()),
		archivePosition: (positionId, positionGroupId) => dispatch(archivePosition({ params: { positionId }, data: { positionGroupId } })),
	};
};

export default connect(null, mapDispatchToProps)(PositionArchiveDelete);