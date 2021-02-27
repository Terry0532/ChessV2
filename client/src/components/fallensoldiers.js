import React from "react";
import "../index.css";

export default class FallenSoldierBlock extends React.Component {
    renderSquare(square) {
        return <button className={"square"} style={{backgroundImage: square.style.backgroundImage, borderColor: "transparent"}}></button>
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.props.whiteFallenSoldiers.map((ws) => this.renderSquare(ws))}
                </div>
                <div className="board-row">
                    {this.props.blackFallenSoldiers.map((bs) => this.renderSquare(bs))}
                </div>
            </div>
        );
    }
}