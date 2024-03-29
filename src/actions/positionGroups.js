import { axiosFillstuff } from 'src/api/constants';

export const getPositionGroups = ({ showRequest = true, emptyData = false } = { showRequest: true, emptyData: false }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		if (showRequest) dispatch({ type: 'REQUEST_POSITION_GROUPS' });
		if (emptyData) dispatch({ type: 'EMPTY_POSITION_GROUPS' });

		return await axiosFillstuff
			.post('/api/getPositionGroups', {
				studioId,
				memberId,
			})
			.then(response => {
				dispatch({
					type: 'RECEIVE_POSITION_GROUPS',
					payload: {
						positionGroups: response.data,
					},
				});
			})
			.catch(error => {
				console.error(error.response);

				return Promise.resolve({ status: 'error' });
			});
	};
};

export const createPositionGroup = ({ data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		return await axiosFillstuff
			.post('/api/createPositionGroup', {
				studioId,
				memberId,
				data,
			})
			.then(async response => {
				await dispatch({
					type: 'CREATE_POSITION_GROUP',
					payload: {
						positionGroup: response.data,
					},
				});

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				if (error.response) {
					return Promise.resolve({ status: 'error', message: error.response.data.message, data: error.response.data });
				} else {
					console.error(error);

					return Promise.resolve({ status: 'error', message: error.message, ...error });
				}
			});
	};
};

export const editPositionGroup = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionGroupId } = params;

		return await axiosFillstuff
			.post('/api/editPositionGroup', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				dispatch({
					type: 'EDIT_POSITION_GROUP',
					payload: {
						positionGroupId,
						positionGroup: response.data,
					},
				});

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				if (error.response) {
					return Promise.resolve({ status: 'error', message: error.response.data.message, data: error.response.data });
				} else {
					console.error(error);

					return Promise.resolve({ status: 'error', message: error.message, ...error });
				}
			});
	};
};

export const addPositionInGroup = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionGroupId } = params;

		return await axiosFillstuff
			.post('/api/addPositionInGroup', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				dispatch({
					type: 'ADD_POSITION_IN_GROUP',
					payload: {
						positionGroupId,
						positionGroup: response.data,
					},
				});

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				if (error.response) {
					return Promise.resolve({ status: 'error', message: error.response.data.message, data: error.response.data });
				} else {
					console.error(error);

					return Promise.resolve({ status: 'error', message: error.message, ...error });
				}
			});
	};
};

export const removePositionFromGroup = ({ params }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		return await axiosFillstuff
			.post('/api/removePositionFromGroup', {
				studioId,
				memberId,
				params,
			})
			.then(response => {
				const positionGroup = response.data;

				dispatch({
					type: 'REMOVE_POSITION_FROM_GROUP',
					payload: {
						positionGroupId: positionGroup._id,
						positionGroup,
					},
				});

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				console.error(error);

				return Promise.resolve({ status: 'error', message: error.message, ...error });
			});
	};
};
