import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Map = ({ locations }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure leaflet is properly loaded
    setIsLoaded(true);
  }, []);

  const getCoordinates = (location) => {
    // Use real coordinates if available, otherwise fallback to [0, 0]
    if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
      return [location.coordinates.lat, location.coordinates.lng];
    }
    return [0, 0]; // Default to [0, 0] if not found
  };

  if (!isLoaded) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        key="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations && locations.length > 0 && locations.map((location) => {
          const coords = getCoordinates(location);
          return (
            <Marker key={location.id || Math.random()} position={coords}>
              <Popup>
                <div>
                  <strong>{location.location || 'Unknown Location'}</strong>
                  <br />
                  Soil Type: {location.soil || 'Unknown'}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
