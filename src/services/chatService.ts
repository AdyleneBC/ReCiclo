import { Conversacion, RolUsuario } from '../types';

export const PRIMER_MENSAJE_SUGERIDO = '¡Hola! Me interesa adquirir tu producto';

export function obtenerFechaHoraActual(): string {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, '0');
  const d = String(ahora.getDate()).padStart(2, '0');
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mm = String(ahora.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function obtenerFechaActual(): string {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, '0');
  const d = String(ahora.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function contarNoLeidos(
  conversaciones: Conversacion[],
  rol: RolUsuario,
  usuarioId: string
): number {
  return conversaciones.reduce((total, conv) => {
    if (rol === 'comerciante' && conv.comercianteId === usuarioId) {
      return total + conv.noLeidosComerciante;
    }
    if (rol === 'ganadero' && conv.ganaderoId === usuarioId) {
      return total + conv.noLeidosGanadero;
    }
    return total;
  }, 0);
}
