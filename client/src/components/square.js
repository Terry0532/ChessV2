import React from "react";
import "../index.css";

export default function Square(props) {
    return (
        <button className={"square " + props.shade + " " + props.rotate}
            onClick={props.onClick}
            style={props.style}
            disabled={props.disabled}
        >
        </button>
    );
}