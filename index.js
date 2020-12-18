//Checks to see if there is an image to return and if not, displays "No Image" image
function checkEmptyImage(inputURL) {
  let outputURL = inputURL
  if (inputURL === undefined) {
      outputURL = "https://legacytaylorsville.com/wp-content/uploads/2015/07/No-Image-Available1.png"
  }
  if (inputURL == null) {
      outputURL = "https://legacytaylorsville.com/wp-content/uploads/2015/07/No-Image-Available1.png"
  }
  if (inputURL == '') {
    outputURL = "https://legacytaylorsville.com/wp-content/uploads/2015/07/No-Image-Available1.png"
}
  return outputURL
}

//Display funtion for Weather Conditions
function displayWeather(responseJson){
  $('#weatherResults-list').empty(); 
  $('#weatherResults-list').append(
    `<div class="weather-pic"><img class="icon" alt="weather icon" src="https://openweathermap.org/img/wn/${responseJson.weather[0].icon}@2x.png"></div>
    <li class="no-list-style">
      <div class="weatherResponse">
        <h3>${responseJson.weather[0].description}</h3>
        <h3>Temp: ${responseJson.main.temp} F</h3>
        <h3>Wind: ${responseJson.wind.speed} mph</h3>
        <h3>Feels like: ${responseJson.main.feels_like} F</h3>
      </div>
     </li>`
  );
  $('#weatherResults').removeClass('hidden'); 
}

//Display funtion for Trail Results
function displayTrails(responseJson){
  $('#results-list').empty();
  
  for(i = 0; i < responseJson.trails.length; i++){
    $('#results-list').append(
      `<li class="results-trails no-list-style resultsLi">
        <a href="${responseJson.trails[i].url}" target="_blank">
          <h3>${responseJson.trails[i].name}</h3>
        </a>
        <p>${responseJson.trails[i].summary}</p>
        <a href="${responseJson.trails[i].url}" target="_blank">
          <img src="${checkEmptyImage(responseJson.trails[i].imgMedium)}">
        </a>
        <p>${responseJson.trails[i].length} Miles</p>
        <p>Difficulty: ${responseJson.trails[i].difficulty}</p>
       </li>`
    );
  }; 
  $('#results').removeClass('hidden');  
}; 

//Function gets weather data by city name and stores coordinates from city location into variables. These coordinate variables are used by both the MTB-Trail API and LeafletJS Map
const apiKey = 'AAwRZXJN82UphfbxWJMgB7mBAMyiR7s4AYRHsIVJ'
//const url = 'https://www.mtbproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200980188-5be1467292990e1d8f7b45e4bf146d25'; 

function getWeather(searchCity, distanceInMiles, maxTrails){

  const weatherKey = 'c0d0f71edb288a219739a1eed183375a'
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=imperial&appid=${weatherKey}`

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      console.log(responseJson)
      let lat = responseJson.coord.lat
      let lon = responseJson.coord.lon
      getTrailData(lat, lon, distanceInMiles, maxTrails)

      // mapInit();
      mapLocation(lat, lon, distanceInMiles)
      displayWeather(responseJson)
    }) 
    //displayResults(responseJson)
    // .then(responseJson => console.log(JSON.stringify(responseJson)))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}; 

//function gets trail data from MTB-Project API
function getTrailData(lat, lon, distanceInMiles, maxTrails){

  const trailKey = '200980188-5be1467292990e1d8f7b45e4bf146d25'
  const url = `https://www.mtbproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=${distanceInMiles}&maxResults=${maxTrails}&key=${trailKey}`

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      console.log(responseJson)
      displayTrails(responseJson)
      //Run Display function???
    }) 
    //displayResults(responseJson)
    // .then(responseJson => console.log(JSON.stringify(responseJson)))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}; 


// leaflet global variable
let mymap = L.map('mapid');

// leaflet initialization
function mapInit(){

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11', 
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYmdvdXQiLCJhIjoiY2s4Mzl2Nnc2MWI1NzNrbG5oZjgwbGJkcCJ9.hrw80AT7Rc-VUrCshSFAzg'
  }).addTo(mymap);

  mymap.setView([ 34.811889, -39.740455], 1);
} 

//function updates the maps location upon second search & updates radius circle
function mapLocation(lat, lon, distanceInMiles){ 
  let latitude = lat; 
  let longitude = lon;

  //converts miles to meters in order to update the map. LeafLetJS only accepts meters
  function getMeters(miles) {
    return miles*1609.344;
  }

  let meters = getMeters(distanceInMiles); 

  mymap.flyTo(new L.LatLng(latitude, longitude), 8); 

  //update radius with max distance variable(may have to create a miles to feet conversion function?) //radius is currently in meters 
  let circle = L.circle([latitude, longitude], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.2,
    radius: meters //500
  }).addTo(mymap);
}; 

//funtion waits for "sumbit" in form then run getWeather() function which initializes all other processes
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();

    const searchCity = $('#city').val();
    console.log(searchCity);
  
    const distanceInMiles = $('#distanceInMiles').val();
    console.log(distanceInMiles);

    const maxTrails = $('#maxTrails').val();
    console.log(maxTrails); 

    //reviels map after "block geolocation" is chosen, but then
    // $('#mapH2').removeClass('hidden');
    // $('#mapid').removeClass('hidden');
    
    getWeather(searchCity, distanceInMiles, maxTrails);

    //clears inputs after search
    $('#city').val('');
    $('#distanceInMiles').val('');
    $('#maxTrails').val(''); 
  });
}

$(watchForm, mapInit());

