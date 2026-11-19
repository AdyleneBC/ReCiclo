import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Eye, MessageSquare, X } from 'lucide-react';
import { Comerciante, Ganadero } from '../types';
import { ProductoConDistancia } from '../services/productService';
import { formatearDistancia } from '../services/mapService';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductMapProps {
  productos: ProductoConDistancia[];
  comerciantes: Comerciante[];
  ganaderoActivo: Ganadero;
  distanciaMaxKm: number | null;
  productoSeleccionado: ProductoConDistancia | null;
  onSeleccionarProducto: (producto: ProductoConDistancia | null) => void;
  onContactarVendedor: (producto: ProductoConDistancia) => void;
  onVerDetalles: (producto: ProductoConDistancia) => void;
  overlaySuperior?: React.ReactNode;
}

function crearIconoProducto(seleccionado: boolean) {
  const color = seleccionado ? '#FF8030' : '#6E9167';
  const ring = seleccionado
    ? '0 0 0 5px rgba(255, 128, 48, 0.25)'
    : '0 2px 6px rgba(20, 23, 20, 0.28)';
  const size = seleccionado ? 24 : 20;

  return L.divIcon({
    className: 'reciclo-map-pin',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #FFFFFF;box-shadow:${ring};transition:transform 150ms ease;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function crearIconoRancho() {
  return L.divIcon({
    className: 'reciclo-ranch-pin',
    html: `<div style="width:24px;height:24px;border-radius:7px;background:#141714;border:2px solid #FFDD8C;box-shadow:0 2px 8px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;color:#FFDD8C;font-size:11px;font-weight:700;">R</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function ProductMap({
  productos,
  comerciantes,
  ganaderoActivo,
  distanciaMaxKm,
  productoSeleccionado,
  onSeleccionarProducto,
  onContactarVendedor,
  onVerDetalles,
  overlaySuperior,
}: ProductMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.295, -99.615],
      zoom: 12,
      zoomControl: false,
    });

    // Control de zoom en zona inferior derecha (alcance del pulgar y sin choque superior)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const ranchMarker = L.marker(
      [ganaderoActivo.coordenadas.lat, ganaderoActivo.coordenadas.lng],
      { icon: crearIconoRancho() }
    );
    ranchMarker.bindTooltip(`Tu ubicación: ${ganaderoActivo.rancho}`, {
      direction: 'top',
      offset: [0, -10],
    });
    ranchMarker.addTo(layerGroup);

    if (distanciaMaxKm !== null) {
      L.circle(
        [ganaderoActivo.coordenadas.lat, ganaderoActivo.coordenadas.lng],
        {
          radius: distanciaMaxKm * 1000,
          color: '#6E9167',
          weight: 1.5,
          dashArray: '6 6',
          fillColor: '#6E9167',
          fillOpacity: 0.06,
        }
      ).addTo(layerGroup);
    }

    const conteoPorCoord: Record<string, number> = {};

    productos.forEach((prod) => {
      const clave = `${prod.latitud.toFixed(4)}_${prod.longitud.toFixed(4)}`;
      const idx = conteoPorCoord[clave] ?? 0;
      conteoPorCoord[clave] = idx + 1;

      const angulo = idx * 1.9;
      const radioOffset = idx === 0 ? 0 : 0.00075 * Math.ceil(idx / 2);
      const lat = prod.latitud + Math.sin(angulo) * radioOffset;
      const lng = prod.longitud + Math.cos(angulo) * radioOffset;

      const seleccionado = productoSeleccionado?.id === prod.id;
      const comerciante = comerciantes.find((c) => c.id === prod.comercianteId);

      const marker = L.marker([lat, lng], {
        icon: crearIconoProducto(seleccionado),
      });

      marker.bindTooltip(
        `${prod.nombre} · $${prod.precioPorKg.toFixed(2)} MXN/kg (${comerciante?.nombreEstablecimiento ?? prod.tipoEstablecimiento})`,
        { direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => {
        onSeleccionarProducto(prod);
      });

      marker.addTo(layerGroup);
    });
  }, [
    productos,
    comerciantes,
    ganaderoActivo,
    distanciaMaxKm,
    productoSeleccionado,
    onSeleccionarProducto,
  ]);

  const comercianteSeleccionado = productoSeleccionado
    ? comerciantes.find((c) => c.id === productoSeleccionado.comercianteId)
    : null;

  return (
    <div className="reciclo-card overflow-hidden rounded-none sm:rounded-2xl border-x-0 sm:border-x">
      {/* Contenedor Leaflet inmediato en la parte superior */}
      <div className="relative h-[52vh] min-h-[340px] sm:h-[460px] w-full">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Controles flotantes opcionales sobre el mapa (buscador y filtros en móvil) */}
        {overlaySuperior && (
          <div className="absolute top-3 left-3 right-3 z-[400] pointer-events-none">
            <div className="pointer-events-auto">{overlaySuperior}</div>
          </div>
        )}

        {/* Leyenda compacta inferior izquierda sobre el mapa */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-[#E4E7E3] rounded-xl px-2.5 py-1.5 flex items-center gap-3 text-[11px] text-[#454B45] shadow-xs pointer-events-none">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6E9167] inline-block" />
            Disponible
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8030] inline-block" />
            Activo
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-[#141714] border border-[#FFDD8C] inline-block" />
            Tu rancho
          </span>
        </div>
      </div>

      {/* Tarjeta del marcador seleccionado */}
      {productoSeleccionado && (
        <div className="p-3.5 sm:p-4 border-t border-[#E4E7E3] bg-[#F7F8F6] reciclo-sheet-enter">
          <div className="bg-white border border-[#E4E7E3] rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row gap-3.5 sm:gap-4 items-start">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-24 h-20 md:w-44 md:h-32 rounded-xl overflow-hidden shrink-0 border border-[#E4E7E3]">
                <ImageWithFallback
                  src={productoSeleccionado.fotografia}
                  alt={productoSeleccionado.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 md:hidden">
                <p className="text-[11px] text-[#6E9167] font-medium truncate">
                  {productoSeleccionado.tipoResiduo}
                </p>
                <h3 className="font-display text-sm font-bold text-[#141714] line-clamp-2">
                  {productoSeleccionado.nombre}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#141714] font-tabular">
                  ${productoSeleccionado.precioPorKg.toFixed(2)} MXN/kg ·{' '}
                  <span className="text-[#6E9167]">
                    {productoSeleccionado.cantidadKg} kg
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSeleccionarProducto(null)}
                aria-label="Cerrar tarjeta de marcador"
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6C736C] hover:text-[#141714] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="hidden md:flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#6E9167] font-medium">
                    {productoSeleccionado.tipoResiduo} ·{' '}
                    {productoSeleccionado.tipoEstablecimiento}
                  </p>
                  <h3 className="font-display text-base font-bold text-[#141714] mt-0.5">
                    {productoSeleccionado.nombre}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onSeleccionarProducto(null)}
                  aria-label="Cerrar tarjeta de marcador"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#6C736C] hover:text-[#141714] rounded-xl hover:bg-[#F7F8F6] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:grid mt-2 grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#6C736C] block">Precio</span>
                  <span className="font-semibold text-[#141714] font-tabular text-sm">
                    ${productoSeleccionado.precioPorKg.toFixed(2)} MXN / kg
                  </span>
                </div>
                <div>
                  <span className="text-[#6C736C] block">Disponible</span>
                  <span className="font-semibold text-[#141714] font-tabular text-sm">
                    {productoSeleccionado.cantidadKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-[#6C736C] block">Vendedor</span>
                  <span className="font-medium text-[#141714] truncate block">
                    {comercianteSeleccionado?.nombre ?? 'Comerciante'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6C736C] block">Distancia</span>
                  <span className="font-medium text-[#6E9167] font-tabular">
                    {formatearDistancia(productoSeleccionado.distanciaKm)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#454B45] md:mt-2.5">
                <span className="font-medium text-[#141714]">
                  {comercianteSeleccionado?.nombre} ·{' '}
                  {comercianteSeleccionado?.nombreEstablecimiento}
                </span>{' '}
                — {productoSeleccionado.ubicacion} (
                {formatearDistancia(productoSeleccionado.distanciaKm)})
              </p>

              <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onContactarVendedor(productoSeleccionado)}
                  className="reciclo-btn-primary inline-flex items-center justify-center gap-2 px-4 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contactar vendedor</span>
                </button>
                <button
                  type="button"
                  onClick={() => onVerDetalles(productoSeleccionado)}
                  className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#6E9167]" />
                  <span>Ver detalles</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
