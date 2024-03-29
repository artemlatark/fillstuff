import React, { Fragment } from 'react';

import { LoadingPage } from 'src/components/Loading';

import PositionDetails from './PositionDetails';
import Receipts from './Receipts';

const View = props => {
	const { positionData, receiptsData, onOpenDialogByName, onArchivedAfterEnded, onChangeSellingPriceReceipt } = props;

	if (!positionData || !positionData.data) return <LoadingPage />;

	const { data: position } = positionData;

	return (
		<Fragment>
			<PositionDetails position={position} onOpenDialogPosition={onOpenDialogByName} onArchivedAfterEnded={onArchivedAfterEnded} />
			<Receipts
				position={position}
				receiptsData={receiptsData}
				onOpenDialogReceipt={onOpenDialogByName}
				onChangeSellingPriceReceipt={onChangeSellingPriceReceipt}
			/>
		</Fragment>
	);
};

export default View;
