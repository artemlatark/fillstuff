import { axiosFillstuff } from 'src/api/constants';

export const getPositions = ({ showRequest = true, emptyData = false } = { showRequest: true, emptyData: false }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		if (showRequest) dispatch({ type: 'REQUEST_POSITIONS' });
		if (emptyData) dispatch({ type: 'EMPTY_POSITIONS' });

		return await axiosFillstuff
			.post('/api/getPositions', {
				studioId,
				memberId,
			})
			.then(response => {
				const positions = response.data;

				dispatch({
					type: 'RECEIVE_POSITIONS',
					payload: { positions },
				});

				return Promise.resolve({ status: 'success', data: positions });
			})
			.catch(error => {
				console.error(error.response);

				return Promise.resolve({ status: 'error' });
			});
	};
};

export const getPosition = ({ params }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		return await axiosFillstuff
			.post('/api/getPosition', {
				studioId,
				memberId,
				params,
			})
			.then(response => {
				const { data: position } = response;

				return Promise.resolve({ status: 'success', data: position });
			})
			.catch(error => {
				console.error(error.response);

				return Promise.resolve({ status: 'error' });
			});
	};
};

export const createPosition = ({ data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;

		return await axiosFillstuff
			.post('/api/createPosition', {
				studioId,
				memberId,
				data,
			})
			.then(response => {
				dispatch({
					type: 'CREATE_POSITION',
					payload: {
						position: response.data,
					},
				});

				return Promise.resolve({ status: 'success', data: response.data });
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

export const editPosition = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionId } = params;

		return await axiosFillstuff
			.post('/api/editPosition', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				const position = response.data;

				dispatch({
					type: 'EDIT_POSITION',
					payload: {
						positionId,
						position,
					},
				});

				return Promise.resolve({ status: 'success', data: position });
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

export const detachPositions = ({ params }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionId } = params;

		return await axiosFillstuff
			.post('/api/detachPositions', {
				studioId,
				memberId,
				params,
			})
			.then(response => {
				const position = response.data;

				dispatch({
					type: 'DETACH_POSITION',
					payload: {
						positionId,
						position,
					},
				});

				return Promise.resolve({ status: 'success', data: position });
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

export const archivePosition = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionId } = params;
		const { positionGroupId } = data;

		return await axiosFillstuff
			.post('/api/archivePosition', {
				studioId,
				memberId,
				params,
			})
			.then(response => {
				dispatch({
					type: 'ARCHIVE_POSITION',
					payload: {
						positionGroupId,
						positionId,
						position: response.data,
					},
				});

				return Promise.resolve({ status: 'success' });
			})
			.catch(error => {
				if (error.response.data.code) {
					return Promise.reject({ status: 'error', message: error.message });
				} else {
					console.error(error);

					dispatch({
						type: 'ERROR_POSITIONS',
						payload: error,
					});

					return Promise.reject({ status: 'error', message: error.message, ...error });
				}
			});
	};
};

export const archivePositionAfterEnded = ({ params, data }) => {
	return async (dispatch, getState) => {
		const {
			user: { data: currentUser },
		} = getState();
		const studioId = currentUser.settings.studio;
		const memberId = currentUser.settings.member._id;
		const { positionId } = params;

		return await axiosFillstuff
			.post('/api/archivePositionAfterEnded', {
				studioId,
				memberId,
				params,
				data,
			})
			.then(response => {
				const position = response.data;

				dispatch({
					type: 'ARCHIVE_POSITION_AFTER_ENDED',
					payload: {
						positionId,
						position,
					},
				});

				return Promise.resolve({ status: 'success', data: position });
			})
			.catch(error => {
				console.error(error);

				dispatch({
					type: 'ERROR_POSITIONS',
					payload: error,
				});

				return Promise.reject({ status: 'error' });
			});
	};
};
