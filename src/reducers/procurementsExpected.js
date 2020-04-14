const procurementsExpected = (
	state = {
		isFetching: false,
		data: null,
	},
	action
) => {
	switch (action.type) {
		case 'REQUEST_PROCUREMENTS_EXPECTED': {
			return {
				...state,
				isFetching: true,
			};
		}
		case 'RECEIVE_PROCUREMENTS_EXPECTED': {
			return {
				...state,
				isFetching: false,
				data: action.payload,
			};
		}
		case 'CREATE_PROCUREMENT_EXPECTED': {
			let stateData = { ...state }.data;

			stateData.data.unshift(action.payload);

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

export default procurementsExpected;
