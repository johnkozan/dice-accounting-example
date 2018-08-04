import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from'react-redux';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger';

import persistState, {mergePersistedState} from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';

import rootReducer from './reducers'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const reducer = compose(
  mergePersistedState(),
)(rootReducer);

const storage = compose(
  filter('secrets'),
)(adapter(window.localStorage));

const enhancer = compose(
  applyMiddleware(sagaMiddleware, createLogger()),
  persistState(storage),
);

const store = createStore(
  reducer,
  enhancer,
);

sagaMiddleware.run(rootSaga)

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
