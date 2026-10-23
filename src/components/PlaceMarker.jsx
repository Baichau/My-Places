import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { categoryColor } from '../utils.js';

const icon = (color, fav, sel) =>
  L.divIcon({
    className: 'pin-wrap',
    html: `<span class="pin${sel ? ' sel' : ''}" style="background:${color}">${fav ? '★' : ''}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

export default function PlaceMarker({ place, selected, onSelect }) {
  return (
    <Marker position={[place.lat, place.lng]} icon={icon(categoryColor(place.category), place.favorite, selected)}
      title={place.name} eventHandlers={{ click: () => onSelect(place) }} />
  );
}
