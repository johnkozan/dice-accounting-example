import { combineReducers } from 'redux';

const initialIdentityState = { fetched: false };

function identity(state = initialIdentityState, action) {
  switch(action.type) {
    case 'FETCH_IDENTITY_DONE':
      return {...state, fetched: true, identity: action.payload};
    case 'LOGOUT_DONE':
      return initialIdentityState;
    default:
      return state;
  }
}

function scatter(state = {}, action) {
  switch(action.type) {
    case 'SET_SCATTER':
      return {...state, scatter: action.payload, connected: true};

    default:
      return state;
  }
}

function errors(state = null, action) {
  switch(action.type) {
    case 'ERROR':
      return action.payload;
    case 'DISMISS_ERROR':
      return null;
    default:
      return state;
  }
}

function profile(state = {fetched: false}, action) {
  switch(action.type) {
    case 'FETCH_PROFILE_DONE':
      return Object.assign({}, ...state, action.payload, {fetched: true, exists: true});
    case 'FETCH_PROFILE_NOT_FOUND':
      return {...state, fetched: true, exists: false}
    default:
      return state;
  }
}

function offers(state = [], action) {
  switch(action.type) {
    case 'FETCH_OFFERS_DONE':
      return action.payload;
    default:
      return state;
  }
}

function games(state = [], action) {
  switch(action.type) {
    case 'FETCH_GAMES_DONE':
      return action.payload;
    default:
      return state;
  }
}

function secrets(state = [], action) {
  switch(action.type) {
    case 'SAVE_SECRET':
      return [...state, action.payload];
    default:
      return state;
  }
}

export default combineReducers({
  errors,
  offers,
  games,
  identity,
  profile,
  secrets,
  scatter,
});
