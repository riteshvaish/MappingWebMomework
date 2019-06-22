// Store our API endpoint inside queryUrl
//var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonic = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

d3.json(tectonic, function(data1) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures1(data1.features);
});

function fillColor(mag) {
  return mag > 5 ? "red":
    mag > 4 ? "orange":
      mag > 3 ? "gold":
        mag > 2 ? "yellow":
          mag > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
}

var faultLines ;

function createFeatures1(faultLineData) {
// Create fault lines
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }
    
    
    // Run the onEachFaultLine function once for each element in the array
     faultLines = L.geoJSON(faultLineData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 2,
        color: 'blue'
      }
    });
    
    
    
}
function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
//console.log("earthquake data features :" + earthquakeData[1].feature[properties]);
 // function onEachFeature(feature, layer) {
  function createCircleMarker(feature, latlng) {
       //Code for Circle start
//        var lat = feature.geometry.coordinates[1];
//        var lon = feature.geometry.coordinates[0];
        var fillcolor = fillColor(feature.properties.mag)
     //  console.log(fillcolor + "  magnitude :" + feature.properties.mag);
        let options = {
       
        fillOpacity: 1,
        color: fillcolor,
        fillColor: fillcolor,
        radius: feature.properties.mag*4
        }
        return L.circleMarker( latlng, options ).bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>"+ feature.properties.title + "</p>"
        );
 
    }
      


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    //onEachFeature: onEachFeature
    pointToLayer: createCircleMarker
  });
    
    
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, faultLines);

}


function createMap(earthquakes, faultlines ) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
    
   var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite" : satellitemap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines : faultlines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [40.4258686, -86.9080655],
   zoom: 3.3,
    layers: [streetmap, earthquakes, faultlines]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
    
  // Adds Legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + fillColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(myMap);
}
