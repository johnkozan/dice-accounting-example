import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, FormControl, Row, Table } from 'react-bootstrap';
import jsSHA from 'jssha';

function randomHash(nChar) {
    let nBytes = Math.ceil(nChar = (+nChar || 8) / 2);
    let u = new Uint8Array(nBytes);
    window.crypto.getRandomValues(u);
    let zpad = str => '00'.slice(str.length) + str;
    let a = Array.prototype.map.call(u, x => zpad(x.toString(16)));
    let str = a.join('').toUpperCase();
    if (nChar % 2) str = str.slice(1);
    return str;
}

export default class Bet extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    secrets: PropTypes.array.isRequired,
  };

  state = {
    secret: '',
    commitment: '',
    bet: '',
  }

  handleOnChange(evt) {
    const chg = Object.assign({}, this.state, {[evt.target.name]: evt.target.value});
    this.setState(chg);
  }

  offerBet() {
    this.props.dispatch({type: 'OFFER_BET', payload: {commitment: this.state.commitment, bet: this.state.bet, secret: this.state.secret}});
    this.setState({secret: '', commitment: '', bet: ''});
  }

  generateSecret() {
    const randStr = randomHash(64);
    let shaObj = new jsSHA('SHA-256', 'HEX');
    shaObj.update(randStr);
    const hash = shaObj.getHash('HEX');
    this.setState({secret: randStr, commitment: hash});
  }

  reveal(commitment, secret) {
    this.props.dispatch({type: 'REVEAL_SECRET', payload: {commitment: commitment, secret: secret}});
  }

  render() {
    const { secrets } = this.props;

    const prevBetRows = secrets.length > 0 ? secrets.map((p, k) => <tr key={`pb-${k}`}>
      <td>{ p.commitment }</td>
      <td><Button bsSize="small" onClick={this.reveal.bind(this, p.commitment, p.secret)}>reveal</Button></td>
    </tr>) :
      <tr><td>No previous bets</td></tr>;

    return <div>

      <Row>
        <Col md={12}>

          <Form inline style={{textAlign: 'center', display: 'inline-block'}}>
            <Button onClick={this.generateSecret.bind(this)}>Generate secret</Button>

            <FormControl name="commitment" disabled={true} value={this.state.commitment} />
            <FormControl name="bet" onChange={this.handleOnChange.bind(this)} value={this.state.bet} />

            <Button onClick={this.offerBet.bind(this)} disabled={this.state.commitment === '' || this.state.bet === ''}>Offer Bet</Button>
          </Form>
        </Col>
      </Row>

      <h4>Previous bets</h4>
      <Table>
        <thead>
          <tr><th>Commitment</th><th></th></tr>
        </thead>
        <tbody>
          { prevBetRows }
        </tbody>
      </Table>

    </div>;
  }
}
