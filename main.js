let errorsEl = document.querySelector('#errors');
let mapEl = document.querySelector('#map');
mapEl.style.width = "600px";
mapEl.style.height = "300px";

let googleMapEl = document.querySelector('#google-map');
googleMapEl.style.width = "600px";
googleMapEl.style.height = "300px";

let stamenUrl = 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg';
let osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
let hotUrl = 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png';
let brightUrl = 'https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=s8WieCgbIwXrAB6k3bm7';
let basicUrl = 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=s8WieCgbIwXrAB6k3bm7';

let stamenLayer = L.tileLayer(stamenUrl);
let osmLayer = L.tileLayer(osmUrl);
let hotLayer = L.tileLayer(hotUrl);
let brightLayer = L.tileLayer(brightUrl);
let basicLayer = L.tileLayer(basicUrl);

let layers = [
  stamenLayer, osmLayer, hotLayer, brightLayer, basicLayer
];

let startCoord = { lat: 37.96152331396614, lng: -118.47656250000001 };
let startZoom = 5;
let map = L.map('map', { layers }).setView(startCoord, startZoom);

let googleMap;
let googleMarker;
function initMap() {
  googleMap = new google.maps.Map(googleMapEl, { center: startCoord, zoom: startZoom });
  googleMarker = new google.maps.Marker({ map: googleMap });
}

L.control.layers({
  "Stamen": stamenLayer,
  "Humanitarian": hotLayer,
  "Bright": brightLayer,
  "Basic": basicLayer,
  "OSM": osmLayer
}).addTo(map);

let marker = L.marker([51.5, -0.09]).addTo(map);


function setMessage(message) {
  errorsEl.innerText = message;
}

function onEnterSetAddress(event) {
  if (event.key === 'Enter') {
    setAddress();
  }
}

function setAddress() {
  let zoom = 16;
  let query = document.querySelector('#address-input').value;
  // let geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyDKm0QF55mheqU3guJUCnmVzk9LOmcQbaY`;
  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((results) => {
      if (!results.status === 'OK') {
        setMessage(`Error: ${JSON.stringify(results)}`)
        return;
      }
      
      let {lat, lng} = results.results[0].geometry.location;
      map.setView([lat, lng], zoom);
      marker.setLatLng([lat, lng]);
      googleMap.setOptions({ center: { lat, lng }, zoom });
      googleMarker.setPosition({ lat, lng });
    })
    .catch((error) => setMessage(error));
}

function parseNominatimResults(results) {
  if (results.length === 0) {
    setMessage("No results found :( Check address spelling. This API is finicky.")
    return;
  }
  let {lat, lon, display_name} = results[0];
  setMessage(`Found result: ${display_name}`);
  map.setView([lat, lon], zoom);
  marker.setLatLng([lat, lon]);
}

function drawAttribution(canvas) {
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ddd';
  ctx.fillRect(0, canvas.height - 18, canvas.width, 18);

  ctx.textAlign = 'right';
  ctx.font = '10px monospace';
  ctx.fillStyle = 'black';
  ctx.fillText(osmAttributionText, canvas.width - 5, canvas.height - 5);
}

function downloadImage() {
  let filenameEl = document.querySelector('#filename');
  setMessage("This can take several seconds");
  leafletImage(map, function(err, canvas) {
    setMessage("");
    // drawAttribution(canvas);
    window.saveAs(canvas.toDataURL(), filenameEl.value);
  });
}

// useful for debugging the attribution on the downloaded image
// let testCanvas = document.querySelector('#test-canvas');
// testCanvas.setAttribute('width', 600);
// testCanvas.setAttribute('height', 300);
// drawAttribution(testCanvas);


