import { Eye, MapPin, MessageSquare } from 'lucide-react';
import { Comerciante } from '../types';
import { ProductoConDistancia } from '../services/productService';
import { formatearDistancia } from '../services/mapService';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  producto: ProductoConDistancia;
  comerciante?: Comerciante;
  seleccionado?: boolean;
  onVerDetalles: (producto: ProductoConDistancia) => void;
  onContactar: (producto: ProductoConDistancia) => void;
  onUbicarEnMapa: (producto: ProductoConDistancia) => void;
}

export function ProductCard({
  producto,
  comerciante,
  seleccionado = false,
  onVerDetalles,
  onContactar,
  onUbicarEnMapa,
}: ProductCardProps) {
  return (
    <article
      className={`reciclo-card reciclo-card-interactive overflow-hidden flex flex-col justify-between ${
        seleccionado ? 'ring-2 ring-[#FF8030] border-[#FF8030]' : ''
      }`}
    >
      <div>
        <div
          onClick={() => onVerDetalles(producto)}
          className="aspect-[4/3] w-full overflow-hidden bg-[#F7F8F6] border-b border-[#E4E7E3] cursor-pointer"
        >
          <ImageWithFallback
            src={producto.fotografia}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <p className="text-xs text-[#6C736C] truncate">
            {producto.tipoResiduo} · {producto.tipoEstablecimiento}
          </p>

          <h3 className="mt-1 font-display text-base font-semibold text-[#141714] leading-snug line-clamp-2">
            {producto.nombre}
          </h3>

          <div className="mt-3 flex items-baseline justify-between gap-2 pb-3 border-b border-[#E4E7E3]">
            <div>
              <span className="font-display text-lg font-bold text-[#141714] font-tabular">
                ${producto.precioPorKg.toFixed(2)}
              </span>
              <span className="text-xs text-[#6C736C] ml-1">/ kg</span>
            </div>
            <span className="text-sm font-semibold text-[#6E9167] font-tabular">
              {producto.cantidadKg} kg
            </span>
          </div>

          <div className="mt-3 space-y-1 text-xs text-[#454B45]">
            <p className="font-medium text-[#141714] truncate">
              {comerciante?.nombreEstablecimiento ?? producto.tipoEstablecimiento}
            </p>
            <p className="truncate text-[#6C736C]">
              Vendedor: {comerciante?.nombre ?? 'Comerciante'}
            </p>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="truncate text-[#6C736C]">
                {producto.ubicacion}
              </span>
              <span className="font-medium text-[#6E9167] font-tabular shrink-0">
                {formatearDistancia(producto.distanciaKm)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onVerDetalles(producto)}
          className="reciclo-btn-primary flex-1 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Ver detalles</span>
        </button>
        <button
          type="button"
          onClick={() => onContactar(producto)}
          title="Contactar vendedor"
          aria-label={`Contactar vendedor por ${producto.nombre}`}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-[#E4E7E3] text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#6E9167]" />
        </button>
        <button
          type="button"
          onClick={() => onUbicarEnMapa(producto)}
          title="Ubicar en mapa"
          aria-label={`Ubicar ${producto.nombre} en mapa`}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-[#E4E7E3] text-[#141714] hover:border-[#FF8030] hover:bg-[#FFF3EB] transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-[#CC4E00]" />
        </button>
      </div>
    </article>
  );
}
