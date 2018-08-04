import React from 'react'; import PropTypes from 'prop-types';
import Bet from './Bet';
import { Button, Col, Form, FormGroup, FormControl, Row } from 'react-bootstrap';
import { NETWORK } from './config';

export default class MyAccount extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    identity: PropTypes.object,
    profile: PropTypes.object,
    secrets: PropTypes.array.isRequired,
  };

  state = {
    deposit: '',
    withdraw: '',
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.identity.fetched && newProps.identity.fetched) {
      this.props.dispatch({type: 'FETCH_PROFILE'});
    }
  }

  handleOnChange(evt) {
    const change = Object.assign({}, this.state, {[evt.target.name]: evt.target.value});
    this.setState(change);
  }

  login() {
    this.props.dispatch({type: 'FETCH_IDENTITY'});
  }

  logout() {
    this.props.dispatch({type: 'LOGOUT'});
  }

  deposit() {
    this.props.dispatch({type: 'DEPOSIT', payload: this.state.deposit});
    this.setState({deposit: ''});
  }

  withdraw() {
    this.props.dispatch({type: 'WITHDRAW', payload: this.state.withdraw});
    this.setState({withdraw: ''});
  }

  render() {
    const { dispatch, identity, profile, secrets } = this.props;

    if (!identity.fetched) {
      return <div>
        <Button onClick={this.login.bind(this)}>Login with Scatter</Button>
      </div>;
    }

    const user = identity.identity;

    if (!profile.fetched) {
      return <div>Loading...</div>;
    }

    const account = user.accounts.find((a) => a.blockchain === NETWORK.blockchain);
    let profileDetails = profile.exists ? (
      <Row>
        <Col md={4}>
          <h3><small>Balance</small>&nbsp;{ profile.eos_balance }</h3>
        </Col>
        <Col md={4}>
          <h3>{ profile.open_offers }&nbsp;<small>Open Offers</small></h3>
        </Col>
        <Col md={4}>
          <h3>{ profile.open_games }&nbsp;<small>Open Games</small></h3>
        </Col>
      </Row>
    ) : (
      <div>No Profile found.  Make a deposit.</div>
    );

    return <div>
      <h2>{ account.name }</h2>

      <br />
      { profileDetails }
      <br />

      <Row>
        <Col md={6}>
          <Form inline style={{textAlign: 'center'}}>
            <FormGroup>
              <FormControl value={this.state.deposit} onChange={this.handleOnChange.bind(this)} name="deposit" />
            </FormGroup>
            <Button onClick={this.deposit.bind(this)} disabled={this.state.deposit === ''}>Deposit</Button>
          </Form>
        </Col>

        <Col md={6}>
          <Form inline>
            <FormGroup>
              <FormControl value={this.state.withdraw} onChange={this.handleOnChange.bind(this)} name="withdraw" />
            </FormGroup>
            <Button onClick={this.withdraw.bind(this)} disabled={this.state.withdraw === ''}>Withdraw</Button>
          </Form>
        </Col>
      </Row>

      <br />

      <Bet dispatch={dispatch} secrets={secrets} />

      <Button onClick={this.logout.bind(this)}>Logout</Button>

    </div>;
  }

}
