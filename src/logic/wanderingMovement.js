export const newPositionAfterWandering = (passengers, startTime) => {
  let odds = 0.9;
  if (new Date().getTime()-startTime > 3500){
    odds = 1 - odds;
  }

  let newPassengers = [];

  for(let i = 0; i < passengers.length; i++){
    if(Math.random() < odds){
      console.log('thistatepassenger[i]', passengers[i])
      let newLat = passengers[i].lat + 0.00005;
      let newLim;
      if(Math.random() < 0.8){
        newLim = passengers[i].lon - 0.00005;
      }else{
        newLim = passengers[i].lon + 0.00005;
      }
      newPassengers.push({"lat": newLat, "lon": newLim})
    }else{
      let newLat = passengers[i].lat - 0.00005;
      let newLim;
      if(Math.random() > odds){
        newLim = passengers[i].lon + 0.00005;
      }else{
        newLim =passengers[i].lon - 0.00005;
      }
      newPassengers.push({"lat": newLat, "lon": newLim})
    }
  }
  return newPassengers;
}
