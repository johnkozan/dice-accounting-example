import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Col, Grid, Row, Well } from 'react-bootstrap';
import Offers from './Offers';
import MyAccount from './MyAccount';

import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.css';

function mapStateToProps(state) {
  return {
    offers: state.offers,
    games: state.games,
    identity: state.identity,
    error: state.errors,
    profile: state.profile,
    secrets: state.secrets,
  };
}

class App extends Component {
  dismissError() {
    this.props.dispatch({type: 'DISMISS_ERROR'});
  }

  render() {
    const { dispatch, offers, games, identity, profile, error, secrets } = this.props;

    const errorMsg = error ? <Alert bsStyle="danger" onDismiss={this.dismissError.bind(this)}>{ error }</Alert> : undefined;

    return (
      <div className="App">
        <Grid fluid>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">EOS Dice Example</h1>
        </header>

        { errorMsg }

        <br />
        <Row>
          <Col md={12}>

            <Well>
              This is an simple implementation of the <a href="https://github.com/EOSIO/eos/tree/master/contracts/dice" target="_blank" rel="noopener noreferrer">example dice contract</a> included with EOS.io.
              <br />
              It is provided as a demonstration only and should not be used for actual gambling.
              <br />
              The contract has been modified to provided accounting infomation to <a href="https://eosfinancials.com" target="_blank" rel="noopener noreferrer">EOS Financials</a> as a demonstration of how to integrate accounting functionality into any EOS dApp.

              <h4>Instructions</h4>

              <ul>
                <li>The <a href="https://get-scatter.com" target="_blank" rel="noopener noreferrer">Scatter browser extension</a> must be installed to interact with this dApp.</li>
                <li><a href="https://github.com/EOSIO/eos/tree/master/contracts/dice/README.md" target="_blank" rel="noopener noreferrer">Follow the contract instructions</a> to authorize dice contract to make transfers on your behalf.
                  (Permission must be set to 'eosio.code' rather than 'active' as shown in the instructions.)
                </li>
              </ul>
            </Well>
          </Col>
        </Row>

        <Offers dispatch={dispatch} offers={offers} games={games} identity={identity} />

        <br />

        <MyAccount profile={profile} identity={identity} dispatch={dispatch} secrets={secrets}  />

      </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
