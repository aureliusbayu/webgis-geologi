// Map Logic for GeoAccess
// Uses Leaflet.js and PapaParse

document.addEventListener('DOMContentLoaded', () => {
    
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQd6v-2fga3orNhiiKMOQCEW-6h_npLvzSz6bc3ng3T0O6r0ySHufd0R6HVwQknZmZHc2bQrWv7Qc_o/pub?output=csv'; 

    const jogjaCenter = [-2.8256, 117.4595]; 
    const initialZoom = 5.5; 
    // ---------------------
    const map = L.map('map', {
        zoomSnap: 0.1
    }).setView(jogjaCenter, initialZoom);

    var CartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
    }).addTo(map);

    var CartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    var geologyLayer = L.tileLayer('tilegeology2/{z}/{x}/{y}.png', {
        minZoom: 5,
        maxNativeZoom: 12,   // Match the min zoom you set in QGIS
        maxZoom: 11,  // Match the max zoom you set in QGIS
        opacity: 1, // Adjust transparency so you can see the map underneath
        tms: false,   // Try setting to true if the tiles appear in the wrong place/upside down
        attribution: 'Kementerian ESDM'
    }).addTo(map);

    const pointsLayer = typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({
            disableClusteringAtZoom: 14,
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            chunkedLoading: true,
            maxClusterRadius: 80
        })
        : L.layerGroup();   

    pointsLayer.addTo(map);

    

    // 2. Fetch Data in the background
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => {
            const entityMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return entityMap[char];
        });
    }

    function safeUrl(url) {
        try {
            const parsed = new URL(String(url || '').trim());
            return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
        } catch (error) {
            return '#';
        }
    }

    function getColor(className) {
        switch (className) {
            case 'Non Bambu': return '#3b82f6'; 
            case 'Bambu': return '#10b981'; 
            default:  return '#6366f1'; 
        }
    }

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("Data loaded for Yogyakarta area...");
            
            results.data.forEach((row) => {
                const lat = Number(row.lat ?? row.latitude);
                const lng = Number(row.long ?? row.lng ?? row.lon ?? row.longitude);

                if (!isNaN(lat) && !isNaN(lng)) {
                    // Construct Popup
                    const markerColor = getColor(String(row.class ?? '').trim());
                    const pointId = escapeHtml(row.ID || 'No ID');
                    const materialType = escapeHtml(row.class || 'No Type');
                    const sampleCategory = escapeHtml(row.category || row.jenis || 'Ground Check');
                    const sampleYear = escapeHtml(row.tahun || row.year || '2025');
                    const photoUrl = safeUrl(row.photo);
                    const imageMarkup = photoUrl !== '#'
                        ? `<img src="${photoUrl}" class="geo-popup-image" alt="Sample Photo">`
                        : `<div class="geo-popup-image-placeholder">No Photo</div>`;

                    const popupContent = `
                        <div class="geo-popup-card">
                            <div class="geo-popup-image-wrap">
                                ${imageMarkup}
                            </div>
                            <div class="geo-popup-panel">
                                <h3 class="geo-popup-title">${pointId}</h3>
                                <div class="geo-popup-meta-row">
                                    <span class="geo-popup-dot"></span>
                                    <span>${sampleCategory}</span>
                                </div>
                                <div class="geo-popup-meta-row">
                                    <span class="geo-popup-dot"></span>
                                    <span>${materialType}</span>
                                </div>
                                <div class="geo-popup-meta-row">
                                    <span class="geo-popup-dot"></span>
                                    <span>${sampleYear}</span>
                                </div>
                                <img src="Geoaccess_White.png" class="geo-popup-logo" alt="Geoaccess logo">
                            </div>
                        </div>
                    `;

                    const pointMarker = L.circleMarker([lat, lng], {
                        radius: 8,
                        fillColor: markerColor,
                        color: "#ffffff", // White border
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    }).bindPopup(popupContent, {
                        className: 'geo-popup-shell',
                        closeButton: false,
                        offset: [0, -2]
                    });

                    pointsLayer.addLayer(pointMarker);
                }
            });

            console.log("All points placed. View remains at Yogyakarta.");
        }
    });
    

    //const legend = L.control({position: 'topright'});

 //   legend.onAdd = function (map) {
 //       const div = L.DomUtil.create('div', 'legend');
 //       
   //     // Header for the legend
     //   div.innerHTML = '<h4>Legenda</h4>'
       // ;
        
        // Define your classes and colors
        //const items = [
          //  { label: 'Bambu', color: '#10b981' },    // Emerald Green
            //{ label: 'Non-Bambu', color: '#3b82f6' } // Bright Blue
        //];

        // Loop through items and add them to the legend
        //items.forEach(item => {
          //  div.innerHTML += `
            //    <div>
              //      <i style="background: ${item.color}"></i>
                //    <span>${item.label}</span>
                //</div>
            //`;
        //});

        //return div;
    //};

    //legend.addTo(map);

    const legend = L.control({ position: 'topright' }); // Positions: 'topleft', 'topright', 'bottomleft', 'bottomright'

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
            <img src="legend2.png" 
                style="width: 195px; background: rgba(255,255,255,0.8); padding: 10px; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.2);"
                alt="Geological Legend">
        `;
        return div;
    };

    // 2. Create an empty layer group to act as the "Legend Toggle"
    const legendToggleLayer = L.layerGroup();

    var basemaps = {
        "Carto Dark": CartoDark,
        "Carto Voyager": CartoVoyager  // This adds the checkbox you want
    };

    // 3. Update your overlayMaps object
    var overlayMaps = {
        "Geological Map": geologyLayer,
        "Show Legend": legendToggleLayer  // This adds the checkbox you want
    };

    // 4. Add the control to the map
    L.control.layers(basemaps, overlayMaps, { collapsed: false }).addTo(map);

    // 5. Logic to show/hide the legend based on that specific checkbox
    map.on('overlayadd', function (eventLayer) {
        if (eventLayer.name === 'Show Legend') {
            legend.addTo(map);
        }
    });

    map.on('overlayremove', function (eventLayer) {
        if (eventLayer.name === 'Show Legend') {
            map.removeControl(legend);
        }
    });
});
