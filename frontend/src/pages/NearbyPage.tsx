import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Navigation, Crosshair, Building2, Map as MapIcon } from 'lucide-react';
import { hospitalApi } from '../utils/api';
import type { Hospital } from '../types';

// Fix default Leaflet marker icons for bundlers (Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface UserPos {
  lat: number;
  lng: number;
}

/** Great-circle distance in kilometers (haversine). */
function haversineKm(a: UserPos, b: UserPos): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function NearbyPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userPos, setUserPos] = useState<UserPos | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'ok' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    hospitalApi.list().then(setHospitals);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  // Auto-try once on mount
  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const located = hospitals.filter(h =>
    typeof h.latitude === 'number' && typeof h.longitude === 'number',
  ) as (Hospital & { latitude: number; longitude: number })[];

  const withDistance = useMemo(
    () =>
      located
        .map(h => ({
          ...h,
          distanceKm: userPos ? haversineKm(userPos, { lat: h.latitude, lng: h.longitude }) : null,
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)),
    [located, userPos],
  );

  const center: [number, number] = userPos
    ? [userPos.lat, userPos.lng]
    : located.length > 0
      ? [located[0].latitude, located[0].longitude]
      : [20.5937, 78.9629]; // India fallback

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Nearby Hospitals
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Hospitals near you, sorted by distance. Your location stays on your device.
          </p>
        </div>
        <button
          onClick={locate}
          disabled={geoStatus === 'locating'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Crosshair className="w-4 h-4" />
          {geoStatus === 'locating' ? 'Locating…' : 'Locate me'}
        </button>
      </div>

      {geoStatus === 'denied' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          Location permission denied — showing hospitals without distance sorting. Allow location
          access in your browser to see which ones are closest.
        </div>
      )}
      {geoStatus === 'unsupported' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          Your browser does not support geolocation.
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <MapContainer
            center={center}
            zoom={userPos ? 12 : located.length > 0 ? 4 : 4}
            style={{ height: 440, width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userPos && (
              <CircleMarker
                center={[userPos.lat, userPos.lng]}
                radius={9}
                pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.9 }}
              >
                <Popup>You are here</Popup>
              </CircleMarker>
            )}
            {withDistance.map(h => (
              <Marker key={h.id} position={[h.latitude, h.longitude]}>
                <Popup>
                  <strong>{h.hospitalName}</strong>
                  <br />
                  {h.city}
                  {h.distanceKm != null && (
                    <>
                      <br />
                      {formatDistance(h.distanceKm)} away
                    </>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sorted list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-blue-600" />
            {userPos ? 'Closest to you' : 'All hospitals'}
          </h2>
          {withDistance.map(h => (
            <div
              key={h.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{h.hospitalName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{h.address || h.city}</p>
                </div>
                {h.distanceKm != null && (
                  <span className="shrink-0 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                    {formatDistance(h.distanceKm)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold ${
                    h.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  ● {h.status}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${h.latitude}&mlon=${h.longitude}#map=16/${h.latitude}/${h.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Navigation className="w-3 h-3" /> Directions
                </a>
              </div>
            </div>
          ))}
          {withDistance.length === 0 && (
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-sm text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No hospitals with known coordinates yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
