import React, { Component } from "react";
import "./Movement.css";

const Movement = (props) => {
  return (
    <button className="movement" onClick={() => props.startMoving()}>
      Move em'!
    </button>
  )
}

export default Movement;
