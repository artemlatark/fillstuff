import { axiosFillstuff } from 'src/api/constants';

export const getWriteOffs = (
	{ query, showRequest = true, mergeData = false, emptyData = false } = {
		showRequest: true,
		mergeData: false,
		emptyData: false,
	}
) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		if (showRequest) dispatch({ type: 'REQUEST_WRITE_OFFS' });
		if (emptyData) dispatch({ type: 'EMPTY_WRITE_OFFS' });

		return await axiosFillstuff
			.post('/api/getWriteOffs', {
				studioId,
				memberId,
				query,
			})
			.then(response => {
				if (!mergeData) {
					dispatch({
						type: 'RECEIVE_WRITE_OFFS',
						payload: response.data,
					});
				} else {
					dispatch({
						type: 'RECEIVE_MERGE_WRITE_OFFS',
						payload: response.data,
					});
				}

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				console.error(error.response);

				return Promise.resolve({ status: 'error' });
			});
	};
};

export const createWriteOff = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionId } = params;

		return await axiosFillstuff
			.post('/api/createWriteOff', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				if (!response.data.code) {
					dispatch({
						type: 'EDIT_POSITION',
						payload: {
							positionId,
							position: response.data,
						},
					});

					return Promise.resolve({ status: 'success' });
				} else {
					return Promise.resolve({ status: 'error', ...response.data });
				}
			})
			.catch(error => {
				console.error(error);

				return Promise.resolve({ status: 'error', message: error.message, ...error });
			});
	};
};

export const cancelWriteOff = ({ params }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { writeOffId } = params;
		const data = { cancellationRequestBy: memberId };

		return await axiosFillstuff
			.post('/api/cancelWriteOff', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				if (!response.data.code) {
					dispatch({
						type: 'CANCEL_WRITE_OFF',
						payload: {
							writeOffId,
							writeOff: response.data,
						},
					});

					return Promise.resolve({ status: 'success' });
				} else {
					return Promise.resolve({ status: 'error', ...response.data });
				}
			})
			.catch(error => {
				console.error(error);

				return Promise.resolve({ status: 'error', message: error.message, ...error });
			});
	};
};
