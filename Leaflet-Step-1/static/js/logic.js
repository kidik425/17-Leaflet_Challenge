var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    getData(data.features);
    //console.log(data)
});

function getData(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>Date & Time: " + new Date(feature.properties.time) +
            "<br>Magnitude: " + feature.properties.mag +
            "<br>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }

    function pointToLayer(feature, latlng) {
        //    console.log(feature.geometry.coordinates[2]) //sanity check to get depth
        var style = {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "#FFF",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
        }
        return L.circleMarker(latlng, style);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function markerSize(mag) {
    return mag / .125;  //this seemed to have a decent weight to it
}

function markerColor(depth) {
    var color;

    if (depth < 10) { color = '#33FF61' }
    else if (depth < 30) { color = '#DDFF33' }
    else if (depth < 50) { color = '#FFE333' }
    else if (depth < 70) { color = '#E6b52E' }
    else if (depth < 90) { color = '#CC9329' }
    else { color = '#A35322' }

    return color;
}

function getColor(category) {
    var color;

    if (category === '-10—9') { color = '#33FF61' }
    else if (category === '10—29') { color = '#DDFF33' }
    else if (category === '30—49') { color = '#FFE333' }
    else if (category === '50—69') { color = '#E6b52E' }
    else if (category === '70—89') { color = '#CC9329' }
    else { color = '#A35322' }

    return color;
}

function createMap(earthquakes) {
    // Define map layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satmap,
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -110
        ],
        zoom: 5,
        layers: [satmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Create a legend to display information about our map
    var legend = L.control({ position: "bottomright" });

    // When the layer control is added, insert a div with the class of "legend"
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");
        categories = ['-10—9', '10—29', '30—49', '50—69', '70—89', '90+'];

        div.innerHTML += '';
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(categories[i]) + '"></i> ' +
                (categories[i] ? categories[i] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);
};
