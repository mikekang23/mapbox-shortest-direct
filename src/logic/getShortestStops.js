import {getHaversineDistance} from './getHaversineDistance';

export const getShortestStops = (passengers, stops) => {
  let indexesOfShortestStops = [];
  for(let i = 0; i < passengers.length; i++){
    let closest = {};
    for(let j = 0; j < stops.length; j++){
      let distance = getHaversineDistance(passengers[i], stops[j]);
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
