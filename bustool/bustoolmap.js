
var mymap = L.map('mapid').setView([42.36, -71.05], 10.5);
var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

// style object for default bus stops
var stopStyle = {
	radius: 2,
	fillColor: "#e58652",
	color: "#a8613a",
	weight: 0.5,
	opacity: 0,
	fillOpacity: 0.8
};

var townStyle = {
	fillColor: "#9b9b9b",
	weight: 2,
	opacity: 0.5,
	color: "#9b9b9b",
	fillOpacity: 0
}
var townsLayer;
// listeners for Towns Layer
// highlights the feature that is being hovered over
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
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
townsLayer = L.geoJSON(townsData,
	{style: townStyle,
	onEachFeature: onEachTown
});

var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {
    this._div.innerHTML = (props ?
        '<b>' + props.TOWN + '</b><br/> Population (2010):  ' + props.POP2010 + '</sup>'
        : 'Hover over a town <br> Click to zoom');
};


$(document).ready(function(){
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  	maxZoom: 16
  }).addTo(mymap);
	townsLayer.addTo(mymap);
	L.geoJSON(stopsData, {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, stopStyle);
		}
	}).addTo(mymap);
	info.addTo(mymap);
});
