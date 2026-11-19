import { Coordenadas } from '../types';

export function calcularDistanciaKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c * 10) / 10;
}

export function formatearDistancia(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export const UBICACIONES_DEMO: Array<{
  etiqueta: string;
  ubicacion: string;
  tipo: 'Central de Abastos' | 'Comercio local';
  coordenadas: Coordenadas;
}> = [
  {
    etiqueta: 'Central de Abastos · Nave A',
    ubicacion: 'Nave A, Central de Abastos Regional',
    tipo: 'Central de Abastos',
    coordenadas: { lat: 19.3148, lng: -99.6168 },
  },
  {
    etiqueta: 'Central de Abastos · Nave B',
    ubicacion: 'Nave B, Central de Abastos Regional',
    tipo: 'Central de Abastos',
    coordenadas: { lat: 19.3162, lng: -99.6145 },
  },
  {
    etiqueta: 'Central de Abastos · Nave C',
    ubicacion: 'Nave C, Central de Abastos Regional',
    tipo: 'Central de Abastos',
    coordenadas: { lat: 19.3175, lng: -99.6122 },
  },
  {
    etiqueta: 'Metepec Centro',
    ubicacion: 'Av. Hidalgo Pte., Metepec Centro',
    tipo: 'Comercio local',
    coordenadas: { lat: 19.2535, lng: -99.6042 },
  },
  {
    etiqueta: 'San Mateo Atenco',
    ubicacion: 'Calle Benito Juárez, San Mateo Atenco',
    tipo: 'Comercio local',
    coordenadas: { lat: 19.2682, lng: -99.5324 },
  },
  {
    etiqueta: 'Zinacantepec',
    ubicacion: 'Calzada del Pacífico, Zinacantepec',
    tipo: 'Comercio local',
    coordenadas: { lat: 19.283, lng: -99.734 },
  },
  {
    etiqueta: 'Zona Centro',
    ubicacion: 'Paseo Tollocan, Zona Centro',
    tipo: 'Comercio local',
    coordenadas: { lat: 19.2889, lng: -99.654 },
  },
  {
    etiqueta: 'Lerma',
    ubicacion: 'Av. Reolin Barejón, Lerma',
    tipo: 'Comercio local',
    coordenadas: { lat: 19.2865, lng: -99.512 },
  },
];
