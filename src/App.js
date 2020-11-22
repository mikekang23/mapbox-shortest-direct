import React, { Component, Fragment } from "react";
import ReactMapGL, {Marker, Source, Layer} from "react-map-gl";
import Pin from "./ui/pin";
import BusDemand from './components/BusDemand';
import Movement from './components/Movement';
import axios from "axios";
import {getShortestStops} from './logic/getShortestStops';
import {newPositionAfterWandering} from './logic/wanderingMovement';

class App extends Component{
  state = {
    viewport: {
      width: "100vw",
      height: "100vh",
      latitude: 45.5115,
      longitude: -73.5711,
      zoom: 15
    },
    passengers: [],
    stops: [],
    shortestPtoS: [],
    hoveredPinIndex: null,
    numOfPeopleClosestToStop: 0,
    moving: false
  };


  componentDidMount() {
    Promise.all([this.getPassengers(), this.getStops()])
      .then(() => {
        this.setState({
          shortestPtoS: this.getShortest()
        })
      })
  }

  getPassengers = () => {
    return axios.get("/passengers.json")
      .then((res) => {
        this.setState({
          passengers: res.data
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getStops = () => {
    return axios.get("/stops.json")
      .then((res) => {
        this.setState({
          stops: res.data
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  setShown = (index, val) => {
    if(val){
      this.setState({
        hoveredPinIndex: index
      }, () => {
        if(this.state.hoveredPinIndex){
          const count = this.state.shortestPtoS.filter((item) => {
            return item.stop.index === index
          });
          this.setState({
            numOfPeopleClosestToStop: count.length
          })
        }
      })
    }else{
      this.setState({
        hoveredPinIndex: null
      })
    }
  }

  getShortest = () => {
    let passengers = this.state.passengers;
    let stops = this.state.stops;
    let indexesOfShortestStops = getShortestStops(passengers, stops);
    return indexesOfShortestStops;
  }

  movePassengers = () => {
    let startTime = new Date().getTime();
    const interval = setInterval(() => {
      if(new Date().getTime() - startTime > 12000){
        clearInterval(interval)
        return;
      }

      let newPositions = newPositionAfterWandering(this.state.passengers, startTime);

      this.setState({
        passengers: newPositions
      }, () => {
        const updateShorted = this.getShortest()
        this.setState({
          shortestPtoS: updateShorted
        }, () => {
          if(this.state.hoveredPinIndex){
            this.setShown(this.state.hoveredPinIndex, true);
          }
        })
      });
    }, 100);
  }

  render() {
    return (
      <Fragment>
        <Movement startMoving={() => this.movePassengers()}/>
        {this.state.hoveredPinIndex ? <BusDemand count={this.state.numOfPeopleClosestToStop}/> : ''}

        <ReactMapGL
          {...this.state.viewport}
          onViewportChange={(viewport) => this.setState({viewport})}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
        >
          {
            this.state.passengers.map((passenger) => {
              return (
                <Marker
                  key={"p-marker" + passenger.lon.toString() + passenger.lat.toString()}
                  longitude={passenger.lon}
                  latitude={passenger.lat}
                >
                  <Pin
                    key={"p-pin" + passenger.lon.toString() + passenger.lat.toString()}
                    size={20}
                    colour="red"
                  />
                </Marker>
              )
            })
          }
          {
            this.state.stops.map((passenger, index) => {
              return (
                <Marker
                  key={"s-marker" +passenger.lon.toString() + passenger.lat.toString()}
                  longitude={passenger.lon}
                  latitude={passenger.lat}
                >
                  <Pin
                    key={"s-pin" + passenger.lon.toString() + passenger.lat.toString()}
                    size={20}
                    colour="blue"
                    pinHoverOver={() => this.setShown(index, true)}
                    pinHoverLeave={() => this.setShown(index, false)}
                  />
                </Marker>
              )
            })
          }

          {this.state.shortestPtoS.map((item,index) => {
            return(
              <Source
                key={"source-"+index}
                id={"routeLine" + index}
                type="geojson"
                data={{
                  "type": "Feature",
                  "geometry": {
                    "type": "LineString",
                    "coordinates": [
                      [item.passenger.lon, item.passenger.lat],
                      [item.stop.lon, item.stop.lat]
                    ]
                  },
                  "properties": {}
                }}
              >
                <Layer
                  key={"layer-"+index}
                  id={"layer"+index}
                  type = "line"
                  source = {"routeLine" + index}
                  layout = {{
                    "line-join": "round",
                    "line-cap": "round"
                  }}
                  paint = {{
                    "line-color": "rgba(80, 204, 107, 0.5)",
                    "line-width": 5
                  }}
                />
                </Source>
              )
            })}
        </ReactMapGL>
      </Fragment>
    );
  }
}

export default App;
