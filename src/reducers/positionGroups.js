const positionGroups = (
	state = {
		isFetching: false,
		data: null,
	},
	action
) => {
	switch (action.type) {
		case 'REQUEST_POSITION_GROUPS': {
			return {
				...state,
				isFetching: true,
			};
		}
		case 'EMPTY_POSITION_GROUPS': {
			return {
				...state,
				data: null,
			};
		}
		case 'RECEIVE_POSITION_GROUPS': {
			return {
				...state,
				isFetching: false,
				data: action.payload,
			};
		}
		case 'CREATE_POSITION_GROUP': {
			let stateData = { ...state }.data;

			stateData.push(action.payload);

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'EDIT_POSITION_GROUP': {
			let stateData = { ...state }.data;
			const positionGroupIndex = stateData.findIndex(positionGroup => positionGroup._id === action.payload.positionGroupId);

			stateData[positionGroupIndex] = action.payload.positionGroup;

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'ADD_POSITION_IN_GROUP': {
			let stateData = { ...state }.data;
			const positionGroupIndex = stateData.findIndex(positionGroup => positionGroup._id === action.payload.positionGroupId);

			stateData[positionGroupIndex].positions = action.payload.positionGroup.positions;

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'REMOVE_POSITION_FROM_GROUP':
		case 'ARCHIVE_POSITION': {
			let stateData;

			if (state.data) {
				stateData = { ...state }.data;

				if (action.payload.positionGroupId) {
					const positionGroupIndex = stateData.findIndex(positionGroup => positionGroup._id === action.payload.positionGroupId);

					if (stateData[positionGroupIndex].positions.length > 1) {
						const positionIndex = stateData[positionGroupIndex].positions.findIndex(position => position._id === action.payload.positionId);

						stateData[positionGroupIndex].positions.splice(positionIndex, 1);
					} else {
						stateData.splice(positionGroupIndex, 1);
					}
				}
			}

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'EDIT_POSITION': {
			let stateData;

			if (state.data) {
				stateData = { ...state }.data;

				if (action.payload.position.positionGroup) {
					const positionGroupIndex = stateData.findIndex(positionGroup => positionGroup._id === action.payload.position.positionGroup);
					const positionIndex = stateData[positionGroupIndex].positions.findIndex(position => position._id === action.payload.positionId);

					stateData[positionGroupIndex].positions[positionIndex] = action.payload.position;
				}
			}

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'CREATE_RECEIPT': {
			let stateData;

			if (state.data) {
				stateData = { ...state }.data;
				const positionGroupIndex = stateData.findIndex(positionGroup =>
					positionGroup.positions.some(position => position._id === action.payload.receipt.position)
				);

				if (positionGroupIndex !== -1) {
					const positionIndex = stateData[positionGroupIndex].positions.findIndex(
						position => position._id === action.payload.receipt.position
					);

					stateData[positionGroupIndex].positions[positionIndex] = {
						...stateData[positionGroupIndex].positions[positionIndex],
						activeReceipt: action.payload.receipt,
						hasReceipts: true,
						receipts: [action.payload.receipt],
					};
				}
			}

			return {
				...state,
				isFetching: false,
				data: stateData,
			};
		}
		case 'UNAUTHORIZED_USER': {
			return {
				...state,
				isFetching: false,
				error: 'unauthorized',
				data: action.payload,
			};
		}
		default:
			return state;
	}
};

export default positionGroups;
