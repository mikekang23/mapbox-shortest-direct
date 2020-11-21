import React, { Component, Fragment } from "react";
import ReactMapGL, {Marker, Source, Layer} from "react-map-gl";
import Pin from "./ui/pin";
import axios from "axios";
import {dataLayer} from "./ui/map-styles";
import {geojson} from "./geojson";
//Mapbox public key would be put into .env file in a production setting with git ignoring it
const MAPBOX_TOKEN = "pk.eyJ1IjoibWlrZWthbmcyMyIsImEiOiJja2hycnJlNzgwMmt0MnNtYWx0bXo1bDllIn0.Bt3qHj6Oj6ZwU1t-N1ZqQw";

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
    shortestPtoS: []
  };

  componentDidMount() {

    let getPassengers = () => {
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

    let getStops = () => {
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

    Promise.all([getPassengers(), getStops()])
      .then(() => {
        this.setState({
          shortestPtoS: this.getShortest()
        })
        console.log(this.state.shortestPtoS);
      })

  }

  getShortest = () => {
    let passengers = this.state.passengers;
    let stops = this.state.stops;
    let indexesOfShortestStops = [];
    for(let i = 0; i < passengers.length; i++){
      let closest = { index:0, distance:0 };
      for(let j = 0; j < stops.length; j++){
        let distance = this.getHaversineDistance(passengers[i], stops[j]);
        if(j === 0){
          closest = {index:0, distance: distance, lat: stops[j].lat, lon: stops[j].lon}
        } else if (closest.distance > distance) {
          closest = {index:j, distance: distance, lat: stops[j].lat, lon: stops[j].lon}
        }
      }
      indexesOfShortestStops.push({
        passenger: {index: i, lat: passengers[i].lat, lon: passengers[i].lon},
        stop: {index: closest.index, lat: closest.lat, lon: closest.lon}
      });
    }
    return indexesOfShortestStops;
  }

  getHaversineDistance = (passengers, stops) => {
    let {lat:lat1, lon:lon1} = passengers;
    let {lat:lat2, lon:lon2} = stops;
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    let dLon = this.deg2rad(lon2-lon1);
    let a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d;
  }

  deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

  render() {
    return (
      <Fragment>
        <ReactMapGL
          {...this.state.viewport}
          onViewportChange={(viewport) => this.setState({viewport})}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          {
            this.state.passengers.map((passenger) => {
              return (
                <Marker
                  key={passenger.lon.toString() + passenger.lat.toString()}
                  longitude={passenger.lon}
                  latitude={passenger.lat}
                >
                  <Pin size={10} colour="red"/>
                </Marker>
              )
            })
          }
          {
            this.state.stops.map((passenger) => {
              return (
                <Marker
                  key={passenger.lon.toString() + passenger.lat.toString()}
                  longitude={passenger.lon}
                  latitude={passenger.lat}
                >
                  <Pin size={10} colour="blue"/>
                </Marker>
              )
            })
          }

          <Source
            id="routeLine"
            type="geojson"
            data={geojson}
          />
            <Layer
              {...dataLayer}
            />
        </ReactMapGL>
      </Fragment>
    );
  }
}

export default App;
