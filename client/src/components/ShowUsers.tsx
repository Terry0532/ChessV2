import React, { Fragment, useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { GameState } from './gameReducer';

type ShowUsersProps = {
  socket: any;
  gameStartConfirmation: (data: any) => void;
  gameState: GameState;
};

type Opponent = {
  id: string;
  name: string;
  played: number;
  won: number;
  draw: number;
}

const ShowUsers: React.FC<ShowUsersProps> = ({ socket, gameStartConfirmation, gameState }) => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  const selectOpponent = (index: number) => {
    socket.emit('selectOpponent', { "id": opponents[index].id });
  };

  useEffect(() => {
    function getOpponentsResponse(data: Opponent[]) {
      setOpponents(data);
    };
    function newOpponentAdded(data: Opponent) {
      setOpponents([...opponents, data]);
    };
    function opponentDisconnected(data: Opponent) {
      let flag = false;
      let i = 0;
      for (i; i < opponents.length; i++) {
        if (opponents[i].id === data.id) {
          flag = true;
          break;
        }
      }
      if (flag) {
        let newOpponents = [...opponents];
        newOpponents.splice(i, 1);
        setOpponents(newOpponents);
      }
    };
    function excludePlayers(data: string[]) {
      for (let j = 0; j < data.length; j++) {
        let flag = false;
        let i = 0;
        for (i = 0; i < opponents.length; i++) {
          if (opponents[i].id === data[j]) {
            flag = true;
            break;
          }
        }
        if (flag) {
          const newOpponents = [...opponents];
          newOpponents.splice(i, 1);
          setOpponents(newOpponents);
        }
      }
    };
    function gameStarted(data: any) {
      gameStartConfirmation(data);
    };

    socket.on('getOpponentsResponse', getOpponentsResponse);
    socket.on('newOpponentAdded', newOpponentAdded);
    socket.on('opponentDisconnected', opponentDisconnected);
    socket.on('excludePlayers', excludePlayers);
    socket.on('alreadyInGame', excludePlayers);
    socket.on('gameStarted', gameStarted);

    return () => {
      socket.off('getOpponentsResponse', getOpponentsResponse);
      socket.off('newOpponentAdded', newOpponentAdded);
      socket.off('excludePlayers', excludePlayers);
      socket.off('alreadyInGame', excludePlayers);
      socket.off('gameStarted', gameStarted);
    };
    // eslint-disable-next-line
  }, [opponents, gameState]);

  useEffect(() => {
    socket.emit("getOpponents", {});
    // eslint-disable-next-line
  }, []);

  return (
    <Fragment>
      <h2>Please select opponent from the following</h2>
      <ListGroup>
        {opponents.map(function (opponent, index) {
          return (
            <ListGroup.Item onClick={() => selectOpponent(index)} action={true} className="opponent-item" key={index}>
              {opponent.name} | Played : {opponent.played}  | Won : {opponent.won}  | Draw : {opponent.draw}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </Fragment>
  );
}

export default ShowUsers;
