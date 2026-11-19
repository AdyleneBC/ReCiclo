import { Coordenadas, FiltrosProducto, Producto } from '../types';
import { calcularDistanciaKm } from './mapService';

export interface ProductoConDistancia extends Producto {
  distanciaKm: number;
}

export const FILTROS_INICIALES: FiltrosProducto = {
  busqueda: '',
  tipoResiduo: 'todos',
  tipoEstablecimiento: 'todos',
  distanciaMaxKm: null,
  precioMin: '',
  precioMax: '',
  cantidadMin: '',
  cantidadMax: '',
};

export function filtrarProductosDisponibles(
  productos: Producto[],
  filtros: FiltrosProducto,
  puntoReferencia: Coordenadas
): ProductoConDistancia[] {
  const busquedaNorm = filtros.busqueda.trim().toLowerCase();
  const pMin = filtros.precioMin !== '' ? Number(filtros.precioMin) : null;
  const pMax = filtros.precioMax !== '' ? Number(filtros.precioMax) : null;
  const cMin = filtros.cantidadMin !== '' ? Number(filtros.cantidadMin) : null;
  const cMax = filtros.cantidadMax !== '' ? Number(filtros.cantidadMax) : null;

  return productos
    .filter((p) => p.estado === 'disponible' && p.cantidadKg > 0)
    .map((p) => ({
      ...p,
      distanciaKm: calcularDistanciaKm(puntoReferencia, {
        lat: p.latitud,
        lng: p.longitud,
      }),
    }))
    .filter((p) => {
      if (busquedaNorm) {
        const matchTexto =
          p.nombre.toLowerCase().includes(busquedaNorm) ||
          p.descripcion.toLowerCase().includes(busquedaNorm) ||
          p.ubicacion.toLowerCase().includes(busquedaNorm);
        if (!matchTexto) return false;
      }

      if (
        filtros.tipoResiduo !== 'todos' &&
        p.tipoResiduo !== filtros.tipoResiduo
      ) {
        return false;
      }

      if (
        filtros.tipoEstablecimiento !== 'todos' &&
        p.tipoEstablecimiento !== filtros.tipoEstablecimiento
      ) {
        return false;
      }

      if (
        filtros.distanciaMaxKm !== null &&
        p.distanciaKm > filtros.distanciaMaxKm
      ) {
        return false;
      }

      if (pMin !== null && !Number.isNaN(pMin) && p.precioPorKg < pMin) {
        return false;
      }

      if (pMax !== null && !Number.isNaN(pMax) && p.precioPorKg > pMax) {
        return false;
      }

      if (cMin !== null && !Number.isNaN(cMin) && p.cantidadKg < cMin) {
        return false;
      }

      if (cMax !== null && !Number.isNaN(cMax) && p.cantidadKg > cMax) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

export const FOTOS_PRODUCTO_MUESTRA: Array<{ etiqueta: string; url: string }> = [
  {
    etiqueta: 'Frutas maduras (Papaya, mango y plátano)',
    url: '/src/assets/images/produce_ripe_fruits_1795118111314.jpg',
  },
  {
    etiqueta: 'Hojas verdes y recortes (Col, lechuga, brócoli)',
    url: '/src/assets/images/produce_leafy_greens_1795118111707.jpg',
  },
  {
    etiqueta: 'Raíces y tubérculos (Papa y zanahoria)',
    url: '/src/assets/images/produce_root_vegetables_1795118112082.jpg',
  },
  {
    etiqueta: 'Cáscaras y bagazo (Cítricos, melón y piña)',
    url: '/src/assets/images/produce_fruit_peels_1795118111522.jpg',
  },
  {
    etiqueta: 'Verduras de segunda (Jitomate, calabacita, calabaza)',
    url: '/src/assets/images/produce_tomato_squash_1795118111024.jpg',
  },
];
