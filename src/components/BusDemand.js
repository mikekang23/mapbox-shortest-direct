import React, { Component } from "react";
import "./BusDemand.css";

class BusDemand extends Component{
  render(){
    return (
      <div className="demand">
        {/* 0 riders, 1 rider, 2riders.. following this grammar convention */}
        <span>{this.props.count} </span> rider{parseInt(this.props.count) === 1 ? '' : 's'} closest to this 🚌 stop.
      </div>
    )
  }
}

export default BusDemand;
