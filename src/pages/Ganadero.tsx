import { useEffect, useMemo, useState } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import {
  FILTROS_INICIALES,
  filtrarProductosDisponibles,
  ProductoConDistancia,
} from '../services/productService';
import { FiltrosProducto, TipoResiduo } from '../types';
import { Filters } from '../components/Filters';
import { ProductMap } from '../components/ProductMap';
import { ProductCard } from '../components/ProductCard';
import { ProductDetail } from '../components/ProductDetail';

const CHIPS_RESIDUO: Array<{ etiqueta: string; valor: TipoResiduo | 'todos' }> =
  [
    { etiqueta: 'Todos', valor: 'todos' },
    { etiqueta: 'Merma de segunda', valor: 'Merma de segunda' },
    { etiqueta: 'Desperdicio limpio', valor: 'Desperdicio limpio' },
    {
      etiqueta: 'Desecho orgánico mezclado',
      valor: 'Desecho orgánico mezclado',
    },
  ];

export function Ganadero() {
  const {
    setRolActivo,
    comerciantes,
    ganaderos,
    productos,
    ganaderoActivoId,
    setGanaderoActivoId,
    ganaderoActivo,
    abrirConversacionParaProducto,
  } = useReCiclo();

  const [filtros, setFiltros] = useState<FiltrosProducto>(FILTROS_INICIALES);
  const [sheetFiltrosAbierto, setSheetFiltrosAbierto] = useState(false);
  const [productoMapaId, setProductoMapaId] = useState<string | null>(null);
  const [productoDetalleId, setProductoDetalleId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setRolActivo('ganadero');
  }, [setRolActivo]);

  const productosFiltrados = useMemo(() => {
    return filtrarProductosDisponibles(
      productos,
      filtros,
      ganaderoActivo.coordenadas
    );
  }, [productos, filtros, ganaderoActivo.coordenadas]);

  const filtrosActivosCount = useMemo(() => {
    let count = 0;
    if (filtros.busqueda.trim()) count++;
    if (filtros.tipoResiduo !== 'todos') count++;
    if (filtros.tipoEstablecimiento !== 'todos') count++;
    if (filtros.distanciaMaxKm !== null) count++;
    if (filtros.precioMin !== '' || filtros.precioMax !== '') count++;
    if (filtros.cantidadMin !== '' || filtros.cantidadMax !== '') count++;
    return count;
  }, [filtros]);

  const productoMapaSeleccionado = useMemo(() => {
    if (!productoMapaId) return null;
    return productosFiltrados.find((p) => p.id === productoMapaId) ?? null;
  }, [productosFiltrados, productoMapaId]);

  const productoDetalle = useMemo(() => {
    if (!productoDetalleId) return null;
    return productos.find((p) => p.id === productoDetalleId) ?? null;
  }, [productos, productoDetalleId]);

  const productoDetalleConDistancia = useMemo(() => {
    if (!productoDetalle) return undefined;
    return productosFiltrados.find((p) => p.id === productoDetalle.id)
      ?.distanciaKm;
  }, [productoDetalle, productosFiltrados]);

  const manejarContactar = (prod: { id: string; comercianteId: string }) => {
    abrirConversacionParaProducto(prod.id, prod.comercianteId);
  };

  const manejarUbicarEnMapa = (prod: ProductoConDistancia) => {
    setProductoMapaId(prod.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const barraFlotanteMapa = (
    <div className="lg:hidden flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-[#6C736C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          aria-label="Buscar producto o zona"
          value={filtros.busqueda}
          onChange={(e) =>
            setFiltros({ ...filtros, busqueda: e.target.value })
          }
          placeholder="Buscar producto o zona..."
          className="w-full min-h-[44px] bg-white/95 backdrop-blur-md border border-[#E4E7E3] rounded-xl pl-10 pr-3 text-sm text-[#141714] shadow-sm focus:outline-none focus:border-[#6E9167]"
        />
      </div>
      <button
        type="button"
        onClick={() => setSheetFiltrosAbierto(true)}
        className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-white/95 backdrop-blur-md text-[#141714] shadow-sm shrink-0 cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#6E9167]" />
        <span>Filtros</span>
        {filtrosActivosCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-tabular rounded-full bg-[#6E9167] text-white inline-flex items-center justify-center">
            {filtrosActivosCount}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto sm:px-6 lg:px-8 pb-6 lg:py-6">
      {/* Layout principal: Mapa siempre primero en la parte superior */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20">
          <Filters
            filtros={filtros}
            onChange={setFiltros}
            onLimpiar={() => setFiltros(FILTROS_INICIALES)}
            totalResultados={productosFiltrados.length}
            ganaderoActivo={ganaderoActivo}
          />
        </div>

        <div className="lg:col-span-9 space-y-4 sm:space-y-6">
          {/* PRIMER ELEMENTO VISIBLE: Mapa interactivo */}
          <ProductMap
            productos={productosFiltrados}
            comerciantes={comerciantes}
            ganaderoActivo={ganaderoActivo}
            distanciaMaxKm={filtros.distanciaMaxKm}
            productoSeleccionado={productoMapaSeleccionado}
            onSeleccionarProducto={(p) => setProductoMapaId(p ? p.id : null)}
            onContactarVendedor={manejarContactar}
            onVerDetalles={(p) => setProductoDetalleId(p.id)}
            overlaySuperior={barraFlotanteMapa}
          />

          {/* Controles de rancho y filtros rápidos debajo del mapa */}
          <div className="px-4 sm:px-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="select-ganadero-activo"
                  className="text-xs font-medium text-[#454B45] whitespace-nowrap"
                >
                  Tu rancho:
                </label>
                <select
                  id="select-ganadero-activo"
                  value={ganaderoActivoId}
                  onChange={(e) => setGanaderoActivoId(e.target.value)}
                  className="reciclo-input py-2 text-xs flex-1 sm:w-auto sm:min-w-[220px]"
                >
                  {ganaderos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre} · {g.rancho}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs font-semibold text-[#6C736C] font-tabular">
                {productosFiltrados.length}{' '}
                {productosFiltrados.length === 1
                  ? 'resultado encontrado'
                  : 'resultados encontrados'}
              </span>
            </div>

            {/* Botones horizontales por tipo de residuo en móvil */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {CHIPS_RESIDUO.map((chip) => {
                const activo = filtros.tipoResiduo === chip.valor;
                return (
                  <button
                    key={chip.valor}
                    type="button"
                    onClick={() =>
                      setFiltros({ ...filtros, tipoResiduo: chip.valor })
                    }
                    className={`px-3.5 min-h-[40px] text-xs font-medium rounded-xl border whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      activo
                        ? 'bg-[#6E9167] border-[#6E9167] text-white'
                        : 'bg-white border-[#E4E7E3] text-[#454B45]'
                    }`}
                  >
                    {chip.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listado de productos */}
          <div className="px-4 sm:px-0">
            <h2 className="font-display text-lg font-bold text-[#141714] mb-3">
              Publicaciones cercanas
            </h2>

            {productosFiltrados.length === 0 ? (
              <div className="reciclo-card p-8 sm:p-10 text-center space-y-3">
                <p className="font-display text-base font-semibold text-[#141714]">
                  No se encontraron productos con los filtros actuales
                </p>
                <p className="text-sm text-[#454B45] max-w-md mx-auto">
                  Amplía el radio de distancia en kilómetros o limpia los
                  filtros de precio y tipo de residuo para ver más resultados.
                </p>
                <button
                  type="button"
                  onClick={() => setFiltros(FILTROS_INICIALES)}
                  className="reciclo-btn-primary inline-flex items-center gap-2 px-4 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {productosFiltrados.map((producto) => {
                  const comerciante = comerciantes.find(
                    (c) => c.id === producto.comercianteId
                  );
                  return (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      comerciante={comerciante}
                      seleccionado={productoMapaId === producto.id}
                      onVerDetalles={(p) => setProductoDetalleId(p.id)}
                      onContactar={manejarContactar}
                      onUbicarEnMapa={manejarUbicarEnMapa}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet de filtros para móvil (< lg) */}
      {sheetFiltrosAbierto && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros móviles"
        >
          <div className="bg-white w-full rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl reciclo-sheet-enter">
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-[#CFD5CD]" />
            </div>
            <div className="px-4 py-2 border-b border-[#E4E7E3] flex items-center justify-between shrink-0">
              <span className="font-display text-base font-bold text-[#141714]">
                Filtrar resultados
              </span>
              <button
                type="button"
                onClick={() => setSheetFiltrosAbierto(false)}
                aria-label="Cerrar filtros"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#454B45]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Filters
                filtros={filtros}
                onChange={setFiltros}
                onLimpiar={() => setFiltros(FILTROS_INICIALES)}
                totalResultados={productosFiltrados.length}
                ganaderoActivo={ganaderoActivo}
                sinBorde
              />
            </div>
            <div className="p-4 border-t border-[#E4E7E3] bg-white pb-safe shrink-0">
              <button
                type="button"
                onClick={() => setSheetFiltrosAbierto(false)}
                className="reciclo-btn-primary w-full min-h-[48px] text-sm font-semibold rounded-xl cursor-pointer font-tabular"
              >
                Mostrar {productosFiltrados.length}{' '}
                {productosFiltrados.length === 1 ? 'resultado' : 'resultados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Bottom Sheet de detalle ampliado del producto */}
      {productoDetalle && (
        <ProductDetail
          producto={productoDetalle}
          comerciante={comerciantes.find(
            (c) => c.id === productoDetalle.comercianteId
          )}
          distanciaKm={productoDetalleConDistancia}
          onCerrar={() => setProductoDetalleId(null)}
          onContactar={() => {
            manejarContactar(productoDetalle);
            setProductoDetalleId(null);
          }}
        />
      )}
    </div>
  );
}
