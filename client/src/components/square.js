import React from "react";
import "../index.css";

export default function Square(props) {
  return (
    <React.Fragment>
    <div className="button">
      <button
        className={"square " + props.shade + " " + props.rotate}
        onClick={props.onClick}
        style={props.style}
        disabled={props.disabled}
      ></button>
    </div>
    </React.Fragment>
  );
}
