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
    stops: L.featureGroup().addTo(map),
    lines: L.featureGroup().addTo(map),
    zones: L.featureGroup().addTo(map),
    sights: L.featureGroup().addTo(map),
    hotels: L.markerClusterGroup({
        disableClusteringAtZoom: 17
    })
}

//LeaftletHash
new L.Hash(map);

//Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap").addTo(map),
        {toggleDisplay:true,
        minimized: true
        }
    ).addTo(map);

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
    "Hotels": themaLayer.hotels.addTo(map),
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
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            //console.log(feature.properties)
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/busstop${feature.properties.LINE_ID}.png`,
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
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
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

//Hotels
async function showHotels(url){
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.hotels)
    //console.log(response, jsondata)
    L.geoJSON(jsondata, {
            pointToLayer: function(feature, latlng) {
                
                if (feature.properties.KATEGORIE_TXT == "nicht kategorisiert") {
                    icon = "icons/hotel_0.png"
                }
                else if (feature.properties.KATEGORIE_TXT == "1*") {
                    icon = "icons/hotel_1.png"
                }
                else if (feature.properties.KATEGORIE_TXT == "2*") {
                    icon = "icons/hotel_2.png"
                }
                else if (feature.properties.KATEGORIE_TXT == "3*") {
                    icon = "icons/hotel_3.png"
                }
                else if (feature.properties.KATEGORIE_TXT == "4*") {
                    icon = "icons/hotel_4.png"
                }
                else if (feature.properties.KATEGORIE_TXT == "5*") {
                    icon = "icons/hotel_5.png"
                }
    

                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/hotel.png',
                        iconUrl: icon,
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37],
                        
                    })
                });
            },

        onEachFeature: function(feature, layer){
            let prop = feature.properties;
            layer.bindPopup(`
            
            <h3>${prop.BETRIEB}</h3>
            <h4>${prop.BETRIEBSART_TXT} ${prop.KATEGORIE_TXT}  </h4>
            <hr></hr>
            Addr.: ${prop.ADRESSE} <br>
            Tel.: <a href="mailto:${prop.KONTAKT_EMAIL}"> ${prop.KONTAKT_EMAIL}</a><br>
            
            <a href="${prop.WEBLINK1}">Homepage</a><br>
            
            
        `);
            //console.log(feature.properties, prop.LINE_NAME);

        }
    }).addTo(themaLayer.hotels);

}
showHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")
