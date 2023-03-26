import React from 'react';
import './App.css';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
// import PanolensRenderer from 'panolens-react';
import coordinatesData from './coordinates.txt';

function App() {
  const [selectedCoordinate, setSelectedCoordinate] = React.useState(null);

  // create a new map object and add a layer with OpenStreetMap tiles
  React.useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // create a new overlay for displaying the selected coordinate
    const overlay = new Overlay({
      element: document.getElementById('overlay'),
      positioning: 'bottom-center',
      offset: [0, -10],
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    map.addOverlay(overlay);

    // add markers to the map for each coordinate in the data file
    coordinatesData.forEach((coordinate) => {
      const [fileName, gpsSeconds, longitude, latitude, altitude, roll, pitch, heading] = coordinate.split(' ');
      const marker = document.createElement('div');
      marker.className = 'marker';
      const markerOverlay = new Overlay({
        element: marker,
        position: fromLonLat([Number(longitude), Number(latitude)]),
        positioning: 'center-center',
      });
      map.addOverlay(markerOverlay);

      // add a click listener to each marker to display the corresponding image
      marker.addEventListener('click', () => {
        setSelectedCoordinate(fileName);
        overlay.setPosition(markerOverlay.getPosition());
      });
    });

    // add event listener to the map to listen for clicks on the coordinates
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const coordinate = feature.getGeometry().getCoordinates();
        const markerOverlay = map.getOverlays().getArray().find((overlay) => overlay.getPosition() === coordinate);
        const index = map.getOverlays().getArray().indexOf(markerOverlay);
        const [fileName] = coordinatesData[index].split(' ');
        setSelectedCoordinate(fileName);
        overlay.setPosition(markerOverlay.getPosition());
      }
    });
  }, []);

  return (
    <div className="App">
      <div id="map" className="map"></div>
      <div className="overlay-container">
        {selectedCoordinate 
        // && (
          // <PanolensRenderer
          //   image={selectedCoordinate.slice(1, -1)}
          //   viewer={{}}
          // />
        // )
        }
        <div id="overlay" className="overlay"></div>
      </div>
    </div>
  );
}

export default App;
