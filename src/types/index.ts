export type TipoResiduo =
  | 'Merma de segunda'
  | 'Desperdicio limpio'
  | 'Desecho orgánico mezclado';

export type TipoEstablecimiento = 'Central de Abastos' | 'Comercio local';

export type EstadoProducto = 'disponible' | 'vendido';

export type TipoOferta = 'economica' | 'trueque';

export type EstadoOferta = 'pendiente' | 'aceptada' | 'rechazada';

export type RolUsuario = 'ganadero' | 'comerciante';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Comerciante {
  id: string;
  nombre: string;
  nombreEstablecimiento: string;
  tipoEstablecimiento: TipoEstablecimiento;
  fotografiaPerfil: string;
  telefono: string;
  ubicacion: string;
  coordenadas: Coordenadas;
  descripcion: string;
}

export interface Ganadero {
  id: string;
  nombre: string;
  rancho: string;
  fotografiaPerfil: string;
  ubicacion: string;
  coordenadas: Coordenadas;
  telefono: string;
  descripcion: string;
}

export interface VentaInfo {
  cantidadVendidaKg: number;
  precioFinalPorKg?: number;
  totalPagado?: number;
  tipoNegociacion: 'compra' | 'trueque';
  detalleTrueque?: string;
  fecha: string;
  ganaderoId: string;
  ganaderoNombre: string;
}

export interface Producto {
  id: string;
  comercianteId: string;
  nombre: string;
  fotografia: string;
  precioPorKg: number;
  cantidadKg: number;
  tipoResiduo: TipoResiduo;
  descripcion: string;
  tipoEstablecimiento: TipoEstablecimiento;
  ubicacion: string;
  latitud: number;
  longitud: number;
  estado: EstadoProducto;
  fechaPublicacion: string;
  ventaInfo?: VentaInfo;
}

export interface Mensaje {
  id: string;
  emisorId: string;
  texto: string;
  fecha: string;
  tipo: 'mensaje' | 'oferta' | 'notificacion';
  ofertaId?: string;
}

export interface Oferta {
  id: string;
  tipo: TipoOferta;
  emisorId: string;
  precioOriginal?: number;
  precioPropuesto?: number;
  productoOfrecido?: string;
  cantidadOfrecida?: number;
  unidadMedida?: string;
  descripcionTrueque?: string;
  cantidadSolicitadaKg: number;
  mensajeOpcional?: string;
  estado: EstadoOferta;
  fecha: string;
}

export interface Conversacion {
  id: string;
  comercianteId: string;
  ganaderoId: string;
  productoId: string;
  mensajes: Mensaje[];
  ofertas: Oferta[];
  noLeidosComerciante: number;
  noLeidosGanadero: number;
}

export interface FiltrosProducto {
  busqueda: string;
  tipoResiduo: TipoResiduo | 'todos';
  tipoEstablecimiento: TipoEstablecimiento | 'todos';
  distanciaMaxKm: number | null;
  precioMin: string;
  precioMax: string;
  cantidadMin: string;
  cantidadMax: string;
}
