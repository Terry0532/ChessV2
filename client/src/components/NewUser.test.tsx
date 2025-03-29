import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NewUser from './NewUser';
import { SocketServerMock } from 'socket.io-mock-ts';

const socket = new SocketServerMock();
const registrationConfirmation = jest.fn();
const startOfflineGame = jest.fn();
const client = socket.clientMock;
//@ts-ignore
client.connect = jest.fn();

let result: string;

const renderComponent = () => {
  render(
    <NewUser 
      socket={client} 
      registrationConfirmation={registrationConfirmation} 
      startOfflineGame={startOfflineGame}
    />
  );
};

describe("NewUser", () => {
  beforeEach(() => {
    renderComponent();

    result = "";

    socket.on('checkUserDetail', (data: any) => {
      result = data.name;
      socket.emit('checkUserDetailResponse', false);
    });
  });

  it("should render game mode selection buttons", () => {
    expect(screen.getByTestId("online-mode-button")).toBeInTheDocument();
    expect(screen.getByTestId("offline-mode-button")).toBeInTheDocument();
  });

  it("should be able to click 'Online Mode' button and switch to username page", () => {
    fireEvent.click(screen.getByTestId("online-mode-button"));

    //@ts-ignore
    expect(client.connect).toHaveBeenCalled();
    expect(screen.getByTestId("enter-username-form")).toBeInTheDocument();
  });

  it("should be able to submit username", () => {
    const name = "test";

    fireEvent.click(screen.getByTestId("online-mode-button"));
    fireEvent.input(screen.getByTestId("username-input"), { target: { value: name } })
    fireEvent.click(screen.getByTestId("submit-username-button"));

    expect(result).toBe(name);
    expect(registrationConfirmation).toHaveBeenCalled();
  });

  it("should warn user name is taken", () => {
    fireEvent.click(screen.getByTestId("online-mode-button"));
    fireEvent.click(screen.getByTestId("submit-username-button"));

    expect(screen.getByText("This username is taken, choose a different username.")).toBeInTheDocument();
  });

  it("should be able to click 'Offline Mode' button to start single player game", () => {
    fireEvent.click(screen.getByTestId("offline-mode-button"));

    expect(startOfflineGame).toHaveBeenCalled();
  });
});
