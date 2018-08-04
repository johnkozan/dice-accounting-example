import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'react-bootstrap';

export default class Offers extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    offers: PropTypes.array.isRequired,
    games: PropTypes.array.isRequired,
    identity: PropTypes.object.isRequired,
  };

  claimExpired(gameId) {
    this.props.dispatch({type: 'CLAIM_EXPIRED', payload: gameId});
  }

  render() {
    const { offers, games, identity } = this.props;

    const offerRows = offers.map((o) => <tr key={o.id}>
      <td>{ o.owner }</td>
      <td>{ o.bet }</td>
      <td>{ o.commitment }</td>
      <td>{ o.game_id }</td>
    </tr>);

    const gamesRows = games.map((g) => <tr key={g.id}>
      <td>{ g.id }</td>
      <td>{ g.bet }</td>
      <td>{ g.deadline }</td>
      <td>{ g.player1.commitment}<br />{ g.player1.reveal }</td>
      <td>{ g.player2.commitment}<br />{ g.player2.reveal }</td>
      <td><Button bsSize="xsmall" onClick={this.claimExpired.bind(this, g.id)} disabled={!identity.fetched}>claim expired</Button></td>
    </tr>);

    return <div>
      <h3>Open Offers</h3>
      <Table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Bet</th>
            <th>Commitment</th>
            <th>Game ID</th>
          </tr>
        </thead>

        <tbody>
          { offerRows }
        </tbody>
      </Table>

      <h3>Open Games</h3>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Bet</th>
            <th>Deadline</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          { gamesRows }
        </tbody>
      </Table>

    </div>;
  }
}
