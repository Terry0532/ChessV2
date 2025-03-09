export default class Piece {
  constructor(player, iconUrl) {
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
