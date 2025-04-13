import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { GameMode, Theme } from '../helpers/types';
import { getButtonVariant } from './game';

type NewUserProps = {
  socket: any;
  registrationConfirmation: (data: boolean) => void;
  startOfflineGame: () => void;
  theme: Theme;
};

const NewUser: React.FC<NewUserProps> = ({ socket, registrationConfirmation, startOfflineGame, theme }) => {
  const [name, setName] = useState<string>("");
  const [nameTaken, setNameTaken] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>();
  
  const submitName = (e) => {
    e.preventDefault();
    socket.emit("checkUserDetail", { name });
  };

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const selectGameMode = (mode: GameMode) => {
    if (mode === GameMode.Online) {
      setGameMode(GameMode.Online);
      socket.connect();
    }
    else if (mode === GameMode.Offline) {
      setGameMode(GameMode.Offline);
      startOfflineGame();
    }
  };

  useEffect(() => {
    function checkUserDetailResponse (data: boolean) {
      registrationConfirmation(data);
      setNameTaken(!data);
    };

    socket.on("checkUserDetailResponse", checkUserDetailResponse);

    return () => {
      socket.off("checkUserDetailResponse", checkUserDetailResponse);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      {gameMode === undefined && (
        <div>
          <Button 
            onClick={() => selectGameMode(GameMode.Online)} 
            variant={getButtonVariant(theme)} 
            type="button"
            style={{ marginRight: 5 }}
            data-testid="online-mode-button"
          >
            Online Mode
          </Button>
          <Button 
            onClick={() => selectGameMode(GameMode.Offline)} 
            variant={getButtonVariant(theme)} 
            type="button"
            data-testid="offline-mode-button"
          >
            Offline Mode
          </Button>
        </div>
      )}
      {gameMode === GameMode.Online && (
        <Form onSubmit={submitName} data-testid="enter-username-form">
          <Form.Group >
            <Form.Label>Enter Your Name</Form.Label>
            <Form.Control type="text" onChange={onNameChange} placeholder="Name" data-testid="username-input" />
            <Form.Text className="text-muted"></Form.Text>
            <Button 
              onClick={submitName} 
              variant="primary" 
              type="button"
              data-testid="submit-username-button"
            >
              Submit
            </Button>
            {nameTaken ? <p>This username is taken, choose a different username.</p> : <p></p>}
          </Form.Group>
        </Form>
      )}
    </div>
  );
};

export default NewUser;
