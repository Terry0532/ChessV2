import { Player } from "../helpers/types";

export default class Piece {
  player: Player;
  style: { backgroundImage: string; backgroundColor: string; };

  constructor(player: Player, iconUrl: string) {
    this.player = player;
    this.style = { backgroundImage: "url('" + iconUrl + "')", backgroundColor: "" };
  }

  setBackgroundColor(color = "rgb(111, 143, 114)") {
    this.style = {
      ...this.style,
      backgroundColor: color,
    };
    return this;
  }
}
