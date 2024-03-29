import React, { useState, lazy, Suspense } from 'react';
import ClassNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import { procurementPositionTransform } from 'src/helpers/utils';

import styles from './Header.module.css';

const DialogPositionArchiveDelete = lazy(() => import('src/views/Dialogs/PositionArchiveDelete'));

const Header = props => {
	const {
		onCloseDialog,
		onOpenDialogByNameIndex,
		storeNotification: { position },
	} = props;
	const [dialogData, setDialogData] = useState({
		position: null,
	});
	const [dialogOpenedName, setDialogOpenedName] = useState('');
	const [dialogs, setDialogs] = useState({
		dialogPositionArchiveDelete: false,
	});

	const procurement = setLastReceipt => {
		const orderedPosition = 'parentPosition' in position ? position.parentPosition : position;

		return {
			orderedReceiptsPositions: [
				{
					position: procurementPositionTransform(orderedPosition, setLastReceipt),
				},
			],
		};
	};

	const onOpenDialogByName = (dialogName, dataType, data) => {
		setDialogOpenedName(dialogName);

		setDialogs({
			...dialogs,
			[dialogName]: true,
		});

		if (dataType && data) {
			setDialogData({
				...dialogData,
				[dataType]: data,
			});
		}
	};

	const onCloseDialogByName = dialogName => {
		setDialogs({
			...dialogs,
			[dialogName]: false,
		});
	};

	const onExitedDialogByName = dataType => {
		setDialogOpenedName('');

		if (dataType) {
			setDialogData({
				...dialogData,
				[dataType]: null,
			});
		}
	};

	return (
		<Grid className={styles.headerActions} alignItems="center" container>
			<Button
				onClick={() => onOpenDialogByNameIndex('dialogProcurementCreate', 'procurement', procurement(true))}
				variant="contained"
				color="primary"
				size="small"
			>
				Оформить закупку
			</Button>
			<Tooltip className={styles.archiveAfterEnded} title="Архивировать" placement="bottom">
				<IconButton
					className={ClassNames({
						[styles.archiveAfterEndedButton]: true,
						destructiveAction: true,
					})}
					onClick={() => onOpenDialogByName('dialogPositionArchiveDelete', 'position', position)}
				>
					<FontAwesomeIcon icon={['far', 'archive']} />
				</IconButton>
			</Tooltip>

			<Suspense fallback={null}>
				<DialogPositionArchiveDelete
					dialogOpen={dialogs.dialogPositionArchiveDelete}
					onCloseDialog={() => onCloseDialogByName('dialogPositionArchiveDelete')}
					onExitedDialog={() => onExitedDialogByName('position')}
					selectedPosition={dialogOpenedName === 'dialogPositionArchiveDelete' ? dialogData.position : null}
					onCallback={onCloseDialog}
				/>
			</Suspense>
		</Grid>
	);
};

export default Header;
