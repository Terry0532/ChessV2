import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SocketServerMock } from 'socket.io-mock-ts';
import ShowUsers from './ShowUsers';
import { initialGameState } from '../components/gameReducer';

const socket = new SocketServerMock();
const client = socket.clientMock;
const gameStartConfirmation = jest.fn();
const gameState = initialGameState;
const mockOpponent = {
  id: "1", name: "test", played: 5, won: 2, draw: 1
}

let selectedId: string;

const renderComponent = () => {
  render(
    <ShowUsers 
      socket={client} 
      gameStartConfirmation={gameStartConfirmation} 
      gameState={gameState}
    />
  );
};

socket.on("getOpponents", () => {
  const opponents = [
    mockOpponent, { ...mockOpponent, id: "2" }
  ];
  socket.emit("getOpponentsResponse", opponents);
});

socket.on("selectOpponent", (opponent: { id: string }) => {
  selectedId = opponent.id;
});

describe("ShowUsers", () => {
  beforeEach(() => {
    renderComponent();
  });

  it("should display list of players available to play with", () => {
    expect(screen.getByTestId("opponent-0")).toBeInTheDocument();
    expect(screen.getByTestId("opponent-1")).toBeInTheDocument();
  });

  it("should be able to select opponent", () => {
    fireEvent.click(screen.getByTestId("opponent-0"));

    expect(selectedId).toBe(mockOpponent.id);
  });

  it("should add a new player to the list on join", () => {
    act(() => {
      socket.emit("newOpponentAdded", { ...mockOpponent, id: "3" });
    });

    expect(screen.getByTestId("opponent-2")).toBeInTheDocument();
  });

  it("should remove player from the list on disconnect", () => {
    act(() => {
      socket.emit("opponentDisconnected", { id: "2" });
    });

    expect(screen.queryByTestId("opponent-1")).not.toBeInTheDocument();
  });

  it("should remove players when they in a game", () => {
    act(() => {
      socket.emit("alreadyInGame", ["2"]);
    });

    expect(screen.queryByTestId("opponent-1")).not.toBeInTheDocument();
  });

  it("should start the game when other player clicked on this user", () => {
    socket.emit("gameStarted", {});

    expect(gameStartConfirmation).toHaveBeenCalled();
  });
});
