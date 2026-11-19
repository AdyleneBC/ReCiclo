import { Oferta } from '../types';

export interface VentaRegistro {
  id: string;
  productoId: string;
  comercianteId: string;
  nombreProducto: string;
  fotografia: string;
  cantidadVendidaKg: number;
  precioFinalPorKg?: number;
  totalPagado?: number;
  tipoNegociacion: 'compra' | 'trueque';
  detalleTrueque?: string;
  fecha: string;
  ganaderoId: string;
  ganaderoNombre: string;
}

export function formatearMoneda(valor: number): string {
  return `$${valor.toFixed(2)} MXN`;
}

export function describirOfertaResumen(oferta: Oferta): string {
  if (oferta.tipo === 'economica') {
    return `Oferta económica: $${(oferta.precioPropuesto ?? 0).toFixed(2)} MXN/kg por ${oferta.cantidadSolicitadaKg} kg`;
  }
  return `Trueque: ${oferta.cantidadOfrecida ?? 0} ${oferta.unidadMedida ?? ''} de ${oferta.productoOfrecido ?? ''} por ${oferta.cantidadSolicitadaKg} kg`;
}
