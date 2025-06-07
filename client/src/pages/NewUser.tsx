import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { GameMode, Theme } from '../helpers/types';
import { createUserWithEmail, signInWithEmail } from '../firebase/auth';
import { useAuth } from '../firebase/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getButtonVariant } from '../helpers/chessGameLogic';

type NewUserProps = {
  socket: any;
  registrationConfirmation: (data: boolean) => void;
  startOfflineGame: () => void;
  theme: Theme;
};

const NewUser: React.FC<NewUserProps> = ({ socket, registrationConfirmation, startOfflineGame, theme }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>("");
  const { currentUser, loading } = useAuth();

  const connectAndRedirect = async (name: string) => {
    socket.connect();
    socket.emit("checkUserDetail", { name });
    registrationConfirmation(true);

    try {
      socket.connect();
      
      // socket.on('connect_error', (error) => {
      //   console.error('Socket connection error:', error);
      //   setErrorMessage('Connection failed. Please try again.');
      // });
      
      socket.emit("checkUserDetail", { name });
      registrationConfirmation(true);
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setErrorMessage('Failed to connect. Please try again.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    let result: any;

    if (isRegistering) {
      result = await createUserWithEmail(email, password, displayName);
    }
    else {
      result = await signInWithEmail(email, password);
    }

    if (result.success) {
      try {
        const userName = result.user.displayName || result.user.email;
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: userName,
            played: 0,
            won: 0,
            lost: 0,
            draw: 0,
            theme: Theme.Light,
            createdAt: new Date()
          });
        }
      } 
      catch (error) {
        console.error("Error saving user to Firestore:", error);
      }

      connectAndRedirect(result.user.displayName || result.user.email);
    }
    else {
      setErrorMessage(result.error.split(": ")[1].trim());
    }
  };

  const selectGameMode = (mode: GameMode) => {
    if (mode === GameMode.Online) {
      if (currentUser && !loading) {
        connectAndRedirect(currentUser.displayName || currentUser.email);
      }
      else {
        setGameMode(GameMode.Online);
      }
    }
    else if (mode === GameMode.Offline) {
      setGameMode(GameMode.Offline);
      startOfflineGame();
    }
  };

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
        <Form onSubmit={handleAuth} data-testid="enter-username-form">
          <Form.Group >
            <Form.Group>
              <Form.Label className={theme}>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                data-bs-theme={theme}
              />
            </Form.Group>
            <Form.Group style={{ marginTop: 5 }}>
              <Form.Label className={theme}>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                data-bs-theme={theme}
              />
            </Form.Group>
            {isRegistering
              ? (
                <div>
                  <Form.Group style={{ marginTop: 5 }}>
                    <Form.Label className={theme}>Display name</Form.Label>
                    <Form.Control
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Name"
                      data-bs-theme={theme}
                    />
                  </Form.Group>
                  <Button
                    onClick={handleAuth}
                    variant={getButtonVariant(theme)}
                    type="submit"
                    data-testid="submit-username-button"
                    style={{ marginTop: 5 }}
                  >
                    Submit
                  </Button>
                </div>
              )
              : (
                <div style={{ marginTop: 5 }}>
                  <Button
                    onClick={handleAuth}
                    variant={getButtonVariant(theme)}
                    type="submit"
                    data-testid="submit-username-button"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegistering(true);
                    }}
                    variant={getButtonVariant(theme)}
                    type="button"
                    data-testid="submit-username-button"
                    style={{ marginLeft: 5 }}
                  >
                    Sign up
                  </Button>
                </div>
              )
            }
            {errorMessage && <p className={theme}>{errorMessage}</p>}
          </Form.Group>
        </Form>
      )}
    </div>
  );
};

export default NewUser;
