import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { GameMode, Theme } from "../helpers/types";
import {
  createUserWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "../firebase/auth";
import { useAuth } from "../firebase/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getButtonVariant } from "../helpers/chessGameLogic";
import { ReactSVG } from "react-svg";
import LoadingIcon from "../icons/bouncing-circles.svg";
import { isValidEmail } from "../helpers/utils";

type NewUserProps = {
  socket: any;
  registrationConfirmation: (data: boolean) => void;
  startOfflineGame: () => void;
  theme: Theme;
};

const NewUser: React.FC<NewUserProps> = ({
  socket,
  registrationConfirmation,
  startOfflineGame,
  theme,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>("");
  const { currentUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      console.error("Error connecting to socket:", error);
      setErrorMessage("Failed to connect. Please try again.");
    }
  };

  const handleAuth = async (e: React.FormEvent, useGoogle: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    let result: any;

    if (isRegistering) {
      result = await createUserWithEmail(email, password, displayName);
    } else if (useGoogle) {
      result = await signInWithGoogle();
      console.log(result);
    } else {
      result = await signInWithEmail(email, password);
    }

    if (result.success) {
      try {
        const userName = result.user.displayName || result.user.email;
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: userName,
            played: 0,
            won: 0,
            lost: 0,
            draw: 0,
            theme: Theme.Light,
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Error saving user to Firestore:", error);
      }

      connectAndRedirect(result.user.displayName || result.user.email);
    } else {
      setErrorMessage(result.error.split(": ")[1].trim());
    }

    setIsLoading(false);
  };

  const selectGameMode = (mode: GameMode) => {
    if (mode === GameMode.Online) {
      if (currentUser && !loading) {
        connectAndRedirect(currentUser.displayName || currentUser.email);
      } else {
        setGameMode(GameMode.Online);
      }
    } else if (mode === GameMode.Offline) {
      setGameMode(GameMode.Offline);
      startOfflineGame();
    }
  };

  const buttonText = (text: string) => {
    return isLoading ? (
      <ReactSVG
        src={LoadingIcon}
        beforeInjection={(svg) => {
          svg.setAttribute("style", "height: 20px");
        }}
      />
    ) : (
      text
    );
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
        <div>
          <Button
            onClick={() => {
              if (gameMode === GameMode.Online && !isRegistering) {
                setGameMode(undefined);
              } else if (isRegistering) {
                setIsRegistering(false);
              }
            }}
            variant={getButtonVariant(theme)}
            type="submit"
            style={{ marginTop: 5 }}
            disabled={isLoading}
          >
            {buttonText("Back")}
          </Button>
          <Form
            onSubmit={(e) => handleAuth(e, false)}
            data-testid="enter-username-form"
          >
            <Form.Group>
              <Form.Group>
                <Form.Label className={theme}>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                  data-bs-theme={theme}
                  isInvalid={email.length > 0 && !isValidEmail(email)}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid email address.
                </Form.Control.Feedback>
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
              {isRegistering ? (
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
                    onClick={(e) => handleAuth(e, false)}
                    variant={getButtonVariant(theme)}
                    type="submit"
                    data-testid="submit-username-button"
                    style={{ marginTop: 5 }}
                    disabled={isLoading || !isValidEmail(email)}
                  >
                    {buttonText("Submit")}
                  </Button>
                </div>
              ) : (
                <div style={{ marginTop: 5 }}>
                  <Button
                    onClick={(e) => handleAuth(e, false)}
                    variant={getButtonVariant(theme)}
                    type="submit"
                    data-testid="submit-username-button"
                    disabled={isLoading || !isValidEmail(email)}
                  >
                    {buttonText("Log in")}
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
                    disabled={isLoading}
                  >
                    Sign up
                  </Button>
                </div>
              )}
              {errorMessage && <p className={theme}>{errorMessage}</p>}
            </Form.Group>
          </Form>
          {!isRegistering && (
            <Button
              onClick={(e) => handleAuth(e, true)}
              variant={getButtonVariant(theme)}
              type="submit"
              style={{ marginTop: 5 }}
              disabled={isLoading}
            >
              {buttonText("Log in with google")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewUser;
