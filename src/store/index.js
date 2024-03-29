import { createStore, compose, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import openSocket from 'socket.io-client';

import { SERVER_URL } from 'src/api/constants';
import getReducers from 'src/reducers';

const IS_PROD = process.env.NODE_ENV === 'production';

// this enables the chrome devtools for redux only in development
// prettier-ignore
// eslint-disable-next-line
const composeEnhancers = (!IS_PROD &&
	typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
	compose;

export const socket = openSocket(`${SERVER_URL}`, {
	path: '/websocket',
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

// init the store with the thunkMiddleware which allows us to make async actions play nicely with the store
// Allow dependency injection of extra reducers and middleware, we need this for SSR
export const initStore = initialState => {
	// prettier-ignore
	// eslint-disable-next-line
	let middleware = !IS_PROD
	                 ? applyMiddleware(thunkMiddleware.withExtraArgument(socket), loggerMiddleware)
	                 : applyMiddleware(thunkMiddleware.withExtraArgument(socket));

	return createStore(getReducers(), initialState || {}, composeEnhancers(middleware));
};
