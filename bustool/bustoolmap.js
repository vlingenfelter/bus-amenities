var url = "https://gisdev.massdot.state.ma.us/arcgis/rest/services/Multimodal/BusShelters/FeatureServer/0/query?where=Stop_ID>0&f=geojson&outFields=*"

// map object declaration
var mymap = L.map('mapid').setView([42.36, -71.05], 10.5);
// declare grey canvas
var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16
});

// style object for default bus stops
var stopStyle = {
  radius: 2,
  fillColor: "#e58652",
  color: "#e58652",
  weight: 0.5,
  opacity: 1,
  fillOpacity: 0.8
};
var allstopStyle = {
  radius: 5,
  fillColor: "#e58652",
  color: "#e58652",
  weight: 0.5,
  opacity: 1,
  fillOpacity: 0.8
};
// styling for shelters
var shelterStyle = {
  radius: 4,
  fillColor: "#1b4e60",
  color: "#1b4e60",
  weight: 0.5,
  opacity: 1,
  fillOpacity: 0.7
};

// style object for default bus stops
var townStyle = {
  fillColor: "#9b9b9b",
  weight: 2,
  opacity: 0.5,
  color: "#9b9b9b",
  fillOpacity: 0
};


// declare layer variables
var townsLayer;
var agreementLayer;
var stopsLayer;
var rankedLayer;
var rankedHeatLayer;
var rankedHeatData = [];
var shelterData;
var shelterLayer;



// listeners for Towns Layer
// highlights the feature that is being hovered over
function highlightFeature(e) {
  // defines variable for mouse hover
  var layer = e.target;
  // set the styling for the layer in question
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.4
  });
  // exclude these browsers
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  // update the info portion of the map to show the attributes of selected layer
  info.update(layer.feature.properties);
};
// resets the town polygons to original style
function resetHighlight(e) {
  townsLayer.resetStyle(e.target);
  info.update();
};
// zooms to the feature when the user clicks on it
function zoomToFeature(e) {
  mymap.fitBounds(e.target.getBounds());
};
// event handler for towns layer
function onEachTown(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
};

// assign the data, styling, and event handler a town layer
townsLayer = L.geoJSON(townsData, {
  style: townStyle,
  onEachFeature: onEachTown
});
// assign the styling to the stops layer
stopsLayer = L.geoJSON(stopsData, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, stopStyle);
  }
});

var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 100, 500],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColors(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};


// dynamic info control that responds to towns layer
var info = L.control();
info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function(props) {
  this._div.innerHTML = (props ?
    '<span style="font-size:1.25em"><b>' + props.TOWN + '</b></span><br/> Population (2010):  ' +
    props.POP2010 + '<br> Is in current agreement? ' + (props.in_agreeme).toUpperCase() :
    'Hover over a town <br> Click to zoom');
};

// clears map of all overlays
function clearMap() {
  if (mymap.hasLayer(stopsLayer)) {
    mymap.removeLayer(stopsLayer);
  }
  if (mymap.hasLayer(townsLayer)) {
    mymap.removeLayer(townsLayer);
    mymap.removeControl(info);
  }
  if (mymap.hasLayer(rankedLayer)) {
    mymap.removeLayer(rankedLayer);
    mymap.removeControl(legend);
  }
  if (mymap.hasLayer(shelterLayer)) {
    mymap.removeLayer(shelterLayer);
  }
};

// sets map to initial open page
function resetMap() {
  clearMap();
  townsLayer.addTo(mymap);
  stopsLayer.addTo(mymap);
  info.addTo(mymap);
  mymap.flyTo([42.36, -71.05], 10.5);
};

// styles ranked stops
function styleRankedStops(feature) {
  return {
    radius: getRadius(feature.properties.rank),
    fillColor: getColors(feature.properties.rank),
    fillOpacity: getOpacity(feature.properties.rank),
    color: getOutlineColors(feature.properties.rank),
    weight: 0.5,
  };
};

// SHELTER DATA HANDLER
// get updated data on shelters and shelter locations from GeoDot
function getShelterData() {
  // ajax get request from GeoDOT MapServer
  // gets all stops with IDS > 0, returns all fields in GeoJSON format
  $.get(url, function(data){
    // turn output JSON string into JSON Object
    shelterData = JSON.parse(data);
    // convert JSON Object to Layer
    shelterLayer =
      L.geoJSON(shelterData, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, shelterStyle);
        }
      });
    // set Pop up to read:
    // Stop ID: [Stop_ID]
    // Shelter Owner: [Shelter_Owner]
    // Property Owner: [Property_Owner]
    shelterLayer.bindPopup(function(layer) {
      return "<b>Stop ID: " + layer.feature.properties.Stop_ID
      + "</b><br> Shelter Owner: " + layer.feature.properties.Shelter_Owner
      + "</b><br> Property Owner: " + layer.feature.properties.Property_Owner;
      // add layer to map
    }).addTo(mymap);
  });
}

function ajaxCallShelterData() {
  // call jquery ajax function
  $.ajax({
    // specify type of ajax call, in this case "GET"
    type: "GET",
    // specify the URL
    url: url,
    // function that defines what to do in the case of a successful 'get'
    success:
      // funciton takes in the data retrieved from the query
      function(data) {
        // data is returned from the API as a string
        // JSON.parse(data): String -> JSON Object
        shelterData = JSON.parse(data);
        // Take the GeoJSON data and turn it into a layer that leaflet can read
        shelterLayer =
          // geoJSON factory
          L.geoJSON(shelterData, {
            // takes points and turns them into circle markers
            pointToLayer: function(feature, latlng) {
              // for each lat long apply Shelter Style
              return L.circleMarker(latlng, shelterStyle);
            }
          });
          shelterLayer.bindPopup(function(layer) {
            return "<b>Stop ID: " + layer.feature.properties.Stop_ID
            + "</b><br> Shelter Owner: " + layer.feature.properties.Shelter_Owner
            + "</b><br> Property Owner: " + layer.feature.properties.Property_Owner;
            // add layer to map
          });
      }
  });
}


function shelterToggleHandler(){
  // checks to see if shelter layer is currently on map
  if (mymap.hasLayer(shelterLayer)) {
    // removes shelter layer if it is on the map
    mymap.removeLayer(shelterLayer);
    // otherwise adds Shelter Data from GeoDOT
  } else {
    shelterLayer.addTo(mymap);
  }
}

// document ready function
$(document).ready(function() {
  initializeChecks();
  lightRailToggleHandler();
  silverLineToggleHandler();
  streetToggleHandler();
  $("#welcome").modal('show');
  Esri_WorldGrayCanvas.addTo(mymap);
  resetMap();
  ajaxCallShelterData();
  // toggles town layer on and off
  $("#toggleTowns").click(function() {
    if (mymap.hasLayer(townsLayer)) {
      mymap.removeLayer(townsLayer);
      mymap.removeControl(info);
    } else {
      townsLayer.addTo(mymap);
      info.addTo(mymap);
    }
  });
  // SHELTER TOGGLE BUTTON
  // selects shelter toggle button
  $("#toggleShelters").click(function() {
    // checks to see if shelter layer is currently on map
    if (mymap.hasLayer(shelterLayer)) {
      // removes shelter layer if it is on the map
      mymap.removeLayer(shelterLayer);
      // otherwise adds Shelter Data from GeoDOT
    } else {
      shelterLayer.addTo(mymap);
    }
  });
  // submits user rankings and user data selections for analysis
  $("#submit").click(function() {
    clearMap();
    /*
    getSliderVals();
    rankedLayer = L.geoJSON(updateJsonScores(stopsData.features), {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, styleRankedStops(feature));
      }
    });
    rankedLayer.bindPopup(function(layer) {
      // add ajax information
      return "<b>" + layer.feature.properties.stop_name + "</b><br> Score: " + Math.round(layer.feature.properties.totalScore);
    });
    rankedLayer.addTo(mymap);
    */
    resetStopsForAnalysis();
    resetVulnComponentLists();
    whichChecks();
    createStopsArray(allstops1005.features);
    populateVulnComponentLists(stopsForAnalysis.features);
    rankedLayer = L.geoJSON(stopsForAnalysis, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, styleRankedStops(feature));
      }
    });
    rankedLayer.bindPopup(function(layer) {
      return "<b>" + layer.feature.properties.stop_name + "</b>"
      + "<br> Z POC: " + layer.feature.properties.Zpoc.toString()
      + "<br> Z LIC: " + layer.feature.properties.Zlic.toString()
      + "<br> Z NV: " + layer.feature.properties.Znv.toString()
      + "<br> Z Sen/TAP: " + layer.feature.properties.ZsenTAP.toString()
      + "<br> Z Org: " + layer.feature.properties.Zorg.toString()
      + "<br> Vuln Z: " + layer.feature.properties.Zvuln.toString()
      + "<br> Rank Vuln: " + layer.feature.properties.rank.toString();
    });
    rankedLayer.addTo(mymap);
    legend.addTo(mymap);
    $("#test").append(stopsCountString + '<br>');

  });

  // resets map display (NOT USER WEIGHTS)
  $("#reset").click(function() {
    resetMap();
  });

});
