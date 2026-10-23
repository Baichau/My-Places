import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PlaceMarker from './PlaceMarker.jsx';

function Controller({ places, focus, picking, onPick, pickPoint }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && places.length) {
      fitted.current = true;
      map.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lng])), { padding: [60, 60], maxZoom: 15 });
    }
  }, [places, map]);
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), { duration: 0.6 }); }, [focus, map]);
  useEffect(() => { if (pickPoint) map.flyTo([pickPoint.lat, pickPoint.lng], Math.max(map.getZoom(), 15), { duration: 0.6 }); }, [pickPoint, map]);
  useMapEvents({ click: (e) => picking && onPick({ lat: e.latlng.lat, lng: e.latlng.lng, n: Date.now() }) });
  useEffect(() => { map.getContainer().style.cursor = picking ? 'crosshair' : ''; }, [picking, map]);
  return null;
}

export default function MapView({ places, selectedId, onSelect, focus, picking, onPick, pickPoint }) {
  return (
    <MapContainer center={[30, 10]} zoom={2} minZoom={2} className="map" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <Controller places={places} focus={focus} picking={picking} onPick={onPick} pickPoint={pickPoint} />
      {places.map((p) => <PlaceMarker key={p.id} place={p} selected={p.id === selectedId} onSelect={onSelect} />)}
      {pickPoint && (
        <PlaceMarker place={{ ...pickPoint, id: 'draft', category: 'Draft', favorite: false, name: 'New place' }} selected onSelect={() => {}} />
      )}
    </MapContainer>
  );
}
