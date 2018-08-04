import { call, fork, put, select, takeLatest } from 'redux-saga/effects'
import Eos from 'eosjs';

import { NETWORK, CONTRACT_ACCOUNT } from './config';

const getScatter = (state) => state.scatter.scatter;
const getIdentity = (state) => state.identity.identity;;

const eosOpts = {
  broadcast: true,
  chainId: NETWORK.chainId,
};

function* makeTx(tx) {
  try {
    const scatter = yield select(getScatter);
    const identity = yield select(getIdentity);
    const account = identity.accounts.find(acc => acc.blockchain === NETWORK.blockchain);
    const eos = scatter.eos(NETWORK, Eos, eosOpts, NETWORK.protocol);

    yield call(eos.transaction, tx(account));
  } catch (e) {
    const err = JSON.parse(e);
    yield put({type: 'ERROR', payload: err.error.details[0].message});
  }
}

function* getTableRows(query) {
  try {
    const scatter = yield select(getScatter);
    const identity = yield select(getIdentity);
    const account = identity ? identity.accounts.find(acc => acc.blockchain === NETWORK.blockchain) : '';
    const eos = scatter.eos(NETWORK, Eos, eosOpts, NETWORK.protocol);

    const resp = yield call(eos.getTableRows, query(account));
    return resp;

  } catch (e) {
    yield put({type: 'ERROR', payload: e.toString()});
  }
}

function* fetchIdentity(action) {
  try {
    const scatter = yield select(getScatter);
    const identity = yield call([scatter, scatter.getIdentity], {accounts: [NETWORK]});
    yield put({type: 'FETCH_IDENTITY_DONE', payload: identity});

  } catch (e) {
    yield put({type: 'ERROR', payload: e.message});
  }
}

function* logoutAction(action) {
  try {
    const scatter = yield select(getScatter);
    scatter.forgetIdentity();
    yield put({type: 'LOGOUT_DONE'});

  } catch (e) {
    yield put({type: 'ERROR', payload: e.message});
  }
}

function* depositAction(action) {
  const tx = (account) => {
    return {
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'deposit',
        authorization: [{
          actor: account.name,
          permission: account.authority,
        }],
        data: {
          from: account.name,
          quantity:  `${Eos.modules.format.DecimalPad(action.payload, 4)} SYS`,
        },
      }],
    };
  }

  yield makeTx(tx);
  yield put({type: 'FETCH_GAMESTATE'});
}

function* withdrawAction(action) {
  const tx = (account) => {
    return {
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'withdraw',
        authorization: [{
          actor: account.name,
          permission: account.authority,
        }],
        data: {
          to: account.name,
          quantity:  `${Eos.modules.format.DecimalPad(action.payload, 4)} SYS`,
        },
      }],
    };
  }

  yield makeTx(tx);
  yield put({type: 'FETCH_GAMESTATE'});
}

function* offerBetAction(action) {
  const tx = (account) => {
    return {
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'offerbet',
        authorization: [{
          actor: account.name,
          permission: account.authority,
        }],
        data: {
          bet: `${Eos.modules.format.DecimalPad(action.payload.bet, 4)} SYS`,
          player: account.name,
          commitment: action.payload.commitment,
        },
      }],
    };
  }

  yield makeTx(tx);
  yield put({type: 'SAVE_SECRET', payload: {commitment: action.payload.commitment, secret: action.payload.secret}});
  yield put({type: 'FETCH_GAMESTATE'});
}

function* revealAction(action) {
  const tx = (account) => {
    return {
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'reveal',
        authorization: [{
          actor: account.name,
          permission: account.authority,
        }],
        data: {
          commitment: action.payload.commitment,
          source: action.payload.secret,
        },
      }],
    };
  }

  yield makeTx(tx);
  yield put({type: 'FETCH_GAMESTATE'});
}

function* claimExpiredAction(action) {
  const tx = (account) => {
    return {
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'claimexpired',
        authorization: [{
          actor: account.name,
          permission: account.authority,
        }],
        data: {
          gameid: action.payload,
        },
      }],
    };
  }

  yield makeTx(tx);
  yield put({type: 'FETCH_GAMESTATE'});
}

function* fetchProfileAction(action) {
  const query = (account) => {
    return {
      code: CONTRACT_ACCOUNT,
      json: true,
      limit: 1,
      lower_bound: account.name,
      scope: CONTRACT_ACCOUNT,
      table: 'account',
    };
  };

  const profile = yield getTableRows(query);

  if (profile.rows.length < 1) {
    // No profile found, return empty profile
    yield put({type: 'FETCH_PROFILE_NOT_FOUND'});
    return;
  }

  yield put({type: 'FETCH_PROFILE_DONE', payload: profile.rows[0]});

}

function* fetchOffersAction(action) {
  const query = () => {
    return {
      code: CONTRACT_ACCOUNT,
      json: true,
      scope: CONTRACT_ACCOUNT,
      table: 'offer',
    };
  };

  const offers = yield getTableRows(query);
  yield put({type: 'FETCH_OFFERS_DONE', payload: offers.rows});
}

function* fetchGamesAction(action) {
  const query = () => {
    return {
      code: CONTRACT_ACCOUNT,
      json: true,
      scope: CONTRACT_ACCOUNT,
      table: 'game',
    };
  };

  const games = yield getTableRows(query);
  yield put({type: 'FETCH_GAMES_DONE', payload: games.rows});
}

function* fetchGamestate() {
  yield put({type: 'FETCH_OFFERS'});
  yield put({type: 'FETCH_GAMES'});
  yield put({type: 'FETCH_PROFILE'});
}

function* sagaActions() {
  yield takeLatest('FETCH_IDENTITY', fetchIdentity);
  yield takeLatest('FETCH_PROFILE', fetchProfileAction);
  yield takeLatest('FETCH_GAMESTATE', fetchGamestate);
  yield takeLatest('FETCH_OFFERS', fetchOffersAction);
  yield takeLatest('FETCH_GAMES', fetchGamesAction);
  yield takeLatest('OFFER_BET', offerBetAction);
  yield takeLatest('CLAIM_EXPIRED', claimExpiredAction);
  yield takeLatest('REVEAL_SECRET', revealAction);
  yield takeLatest('DEPOSIT', depositAction);
  yield takeLatest('WITHDRAW', withdrawAction);
  yield takeLatest('LOGOUT', logoutAction);
}

function getScatterExtension() {
  return new Promise((resolve, reject) => {
    document.addEventListener('scatterLoaded', () => {
      const scatter = window.scatter;
      window.scatter = null;
      resolve(scatter);
    });
  });
}

function* connectScatterSaga() {
  let scatter;

  try {
    if (window.scatter) {
      scatter = window.scatter;
      window.scatter = null;
      yield put({type: 'SET_SCATTER', payload: scatter});
    } else {
      scatter = yield getScatterExtension();
      yield put({type: 'SET_SCATTER', payload: scatter});
    }

    yield call(scatter.suggestNetwork, NETWORK);
    yield put({type: 'FETCH_GAMESTATE'});
  } catch(e) {
    let errMsg = typeof(e) === 'object' && e.message ? e.message : 'Error connecting to Scatter';
    yield put({type: 'ERROR', payload: errMsg});
  }
}

export default function* root() {
  yield [
    fork(connectScatterSaga),
    fork(sagaActions),
  ];
}
