import React, { Fragment, useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { GameState, Opponent, Theme, UserStatus } from '../helpers/types';
import { rtdb } from '../firebase/config';
import { onChildAdded, onChildChanged, onChildRemoved, ref, Unsubscribe } from 'firebase/database';
import { getCurrentUser } from '../firebase/auth';

type ShowUsersProps = {
  socket: any;
  gameStartConfirmation: (data: any) => void;
  gameState: GameState;
};

const ShowUsers: React.FC<ShowUsersProps> = ({ socket, gameStartConfirmation, gameState }) => {
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  const selectOpponent = (index: number) => {
    socket.emit('selectOpponent', { "id": opponents[index].socketId });
  };

  useEffect(() => {
    function gameStarted(data: any) {
      gameStartConfirmation(data);
    };
    socket.on('gameStarted', gameStarted);
    return () => {
      socket.off('gameStarted', gameStarted);
    };
  }, [socket, gameStartConfirmation]);

  useEffect(() => {
    const statusRef = ref(rtdb, 'status');
    const listeners: Unsubscribe[] = [];
    const currentUser = getCurrentUser();
    
    const addedUnsubscribe = onChildAdded(statusRef, (snapshot) => {
      const uid = snapshot.key;
      const user = snapshot.val() as UserStatus;
      
      if (uid !== currentUser.uid && user.state === 'online' && user.socketId) {
        setOpponents((prev) => {
          if (!prev.some((opponent) => opponent.uid === uid)) {
            return [...prev, {
              uid,
              socketId: user.socketId,
              name: user.displayName,
              played: 0,
              won: 0,
              draw: 0
            }];
          }
          return prev;
        });
      }
    });
    listeners.push(addedUnsubscribe);
    
    const changedUnsubscribe = onChildChanged(statusRef, (snapshot) => {
      const uid = snapshot.key;
      const user = snapshot.val() as UserStatus;
      
      setOpponents((prev) => {
        if (uid === currentUser.uid) {
          return prev;
        }
        if (user.state === "online" && user.socketId) {
          const index = prev.findIndex((opponent) => opponent.uid === uid);
          
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              name: user.displayName,
            };
            return updated;
          } 
          else {
            return [...prev, {
              uid,
              socketId: user.socketId,
              name: user.displayName,
              played: 0,
              won: 0,
              draw: 0
            }];
          }
        } 
        else if (user.state === "offline") {
          return prev.filter((opponent) => opponent.uid !== uid);
        }
      });
    });
    listeners.push(changedUnsubscribe);
    
    const removedUnsubscribe = onChildRemoved(statusRef, (snapshot) => {
      setOpponents((prev) => prev.filter(opponent => opponent.uid !== snapshot.key));
    });
    listeners.push(removedUnsubscribe);
    
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return (
    <Fragment>
      <h2 data-testid="game-lobby" className={gameState.theme}>Please select opponent from the following</h2>
      <ListGroup>
        {opponents.map(function (opponent, index) {
          return (
            <ListGroup.Item 
              onClick={() => selectOpponent(index)} 
              action={true} 
              className={"opponent-item" + (gameState.theme === Theme.Light ? " light" : " dark")} 
              key={index}
              data-testid={"opponent-" + index}
            >
              {opponent.name} | Played : {opponent.played}  | Won : {opponent.won}  | Draw : {opponent.draw}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </Fragment>
  );
};

export default ShowUsers;
