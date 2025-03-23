import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FallenSoldierBlock from './fallensoldiers';
import Knight from '../pieces/knight';
import Bishop from '../pieces/bishop';
import { Player } from '../helpers/types';

const renderComponent = (whiteFallenSoldiers: any[], blackFallenSoldiers: any[]) => {
  render(
    <FallenSoldierBlock 
      whiteFallenSoldiers={whiteFallenSoldiers} 
      blackFallenSoldiers={blackFallenSoldiers} 
    />
  );
};

describe("fallensoldiers", () => {
  it("should be able to render correct fallen soldiers", () => {
    const whiteFallenSoldiers = [];
    const blackFallenSoldiers = [];

    whiteFallenSoldiers.push(new Knight(Player.White));
    blackFallenSoldiers.push(new Bishop(Player.Black));

    renderComponent(whiteFallenSoldiers, blackFallenSoldiers);

    const fallenSoldiers = screen.getAllByTestId("fallen-soldier-square-0");

    expect(fallenSoldiers[0]).toBeInTheDocument();
    expect(fallenSoldiers[1]).toBeInTheDocument();
  });
});
