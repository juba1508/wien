/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

// Karte initialisieren
let map = L.map("map").setView([
    stephansdom.lat, stephansdom.lng
], 15);

map.addControl(new L.Control.Fullscreen({
    title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
    }
}));

//thematische Layer 
let themaLayer = {
    stops: L.featureGroup(),
    lines: L.featureGroup(),
    zones: L.featureGroup(),
    sights: L.featureGroup().addTo(map),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
}, {
    "Vienna Sightseeing Haltestellen": themaLayer.stops,
    "Vienna Sightseeing Linien": themaLayer.lines,
    "Fußgängerzonen": themaLayer.zones,
    "Sehenswürdigkeiten": themaLayer.sights,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Vienna Sightseeing Haltestellen
//asynchrone Funktion, damit schneller geladen werden kann
async function showStops(url) {
    let response = await fetch(url); //Anfrage, Antwort kommt zurück
    let jsondata = await response.json(); //json Daten aus Response entnehmen 
    let busstopsColors = {
        1: "#FF4136", //Red Line
        2: "#FFDC00",//Yellow Line
        3: "#0074D9", //Blue Line 
        4: "#2ECC40", //Green Line
        5: "#AAAAAA", //Grey Line
        6: "#FF851B", //Orange Line
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: busstopsColors[feature.properties.stops.BUSSTOPS_ID],
                weight: 3,
                dashArray: [10, 6],
            }; //https://leafletjs.com/reference.html#geojson-style
        },
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`      
            <h4> <i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</h4>
            <station> ${prop.STAT_NAME} </station>           
            `);
        }
    }).addTo(themaLayer.stops); //alle Busstopps anzeigen als Marker
}
showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json"); //aufrufen der Funktion 

async function showLines(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    let lineNames = {};
    let lineColors = {
        1: "#FF4136", //Red Line
        2: "#FFDC00",//Yellow Line
        3: "#0074D9", //Blue Line 
        4: "#2ECC40", //Green Line
        5: "#AAAAAA", //Grey Line
        6: "#FF851B", //Orange Line
    }
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: lineColors[feature.properties.LINE_ID],
                weight: 3,
                dashArray: [10, 6],
            }; //https://leafletjs.com/reference.html#geojson-style
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`   
            <h4> <i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</h4>  
            <start> <i class="fa-regular fa-circle-stop"></i> ${prop.FROM_NAME} </start> </br>
            <i class="fa-solid fa-arrow-down"></i> </br>
            <end> <i class="fa-regular fa-circle-stop"></i> ${prop.TO_NAME}</end>          
            `);
            lineNames[prop.LINE_ID] = prop.LINE_NAME
        }
    }).addTo(themaLayer.lines);
}
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");

async function showSights(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            L.marker(latlng).addTo(map)
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
            <img src = "${prop.THUMBNAIL}" alt="*" > 
            <h4><a href="${prop.WEITERE_INF}" target="Wien">${prop.NAME}</a></h4>
            <address>${prop.ADRESSE}</adress>
            `);
        }
    }).addTo(themaLayer.sights);
}
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");

async function showZones(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        style: function (feature)
           { return {    
                color:"#F012BE",
                weight: 1,
                opacity: 0.4,
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
            <h4> Fußgängerzone${prop.ADRESSE} </h4>
            <opening> <i class="fa-solid fa-clock"></i> ${prop.ZEITRAUM||"dauerhaft"} </opening> </br> </br>
            <info> <i class="fa-solid fa-circle-info"></i> ${prop.AUSN_TEXT||"keine Ausnahmen"}</info>
            `)
        }
    }).addTo(themaLayer.zones);
}
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");

