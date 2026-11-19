import { RotateCcw, Search } from 'lucide-react';
import {
  FiltrosProducto,
  Ganadero,
  TipoEstablecimiento,
  TipoResiduo,
} from '../types';

interface FiltersProps {
  filtros: FiltrosProducto;
  onChange: (nuevos: FiltrosProducto) => void;
  onLimpiar: () => void;
  totalResultados: number;
  ganaderoActivo: Ganadero;
  sinBorde?: boolean;
}

const TIPOS_RESIDUO: Array<TipoResiduo | 'todos'> = [
  'todos',
  'Merma de segunda',
  'Desperdicio limpio',
  'Desecho orgánico mezclado',
];

const TIPOS_ESTABLECIMIENTO: Array<TipoEstablecimiento | 'todos'> = [
  'todos',
  'Central de Abastos',
  'Comercio local',
];

export function Filters({
  filtros,
  onChange,
  onLimpiar,
  totalResultados,
  ganaderoActivo,
  sinBorde = false,
}: FiltersProps) {
  const actualizar = <K extends keyof FiltrosProducto>(
    campo: K,
    valor: FiltrosProducto[K]
  ) => {
    onChange({ ...filtros, [campo]: valor });
  };

  return (
    <aside
      aria-label="Filtros de búsqueda"
      className={
        sinBorde
          ? 'space-y-5'
          : 'reciclo-card p-5 space-y-5'
      }
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4E7E3]">
        <div>
          <h2 className="font-display text-base font-semibold text-[#141714]">
            Filtros de búsqueda
          </h2>
          <p className="text-xs text-[#6C736C] mt-0.5 font-tabular">
            {totalResultados}{' '}
            {totalResultados === 1
              ? 'resultado encontrado'
              : 'resultados encontrados'}
          </p>
        </div>
        <button
          type="button"
          onClick={onLimpiar}
          className="inline-flex items-center gap-1.5 px-3 min-h-[40px] text-xs font-medium text-[#454B45] hover:text-[#141714] border border-[#E4E7E3] rounded-xl hover:bg-[#F7F8F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Búsqueda por texto */}
      <div>
        <label
          htmlFor={sinBorde ? 'filtro-busqueda-sheet' : 'filtro-busqueda'}
          className="block text-xs font-medium text-[#454B45] mb-1.5"
        >
          Buscar producto o zona
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#6C736C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id={sinBorde ? 'filtro-busqueda-sheet' : 'filtro-busqueda'}
            type="text"
            value={filtros.busqueda}
            onChange={(e) => actualizar('busqueda', e.target.value)}
            placeholder="Ej. papaya, zanahoria, Metepec..."
            className="reciclo-input pl-10"
          />
        </div>
      </div>

      {/* Tipo de residuo */}
      <div>
        <label
          htmlFor={sinBorde ? 'filtro-residuo-sheet' : 'filtro-residuo'}
          className="block text-xs font-medium text-[#454B45] mb-1.5"
        >
          Tipo de residuo
        </label>
        <select
          id={sinBorde ? 'filtro-residuo-sheet' : 'filtro-residuo'}
          value={filtros.tipoResiduo}
          onChange={(e) =>
            actualizar(
              'tipoResiduo',
              e.target.value as TipoResiduo | 'todos'
            )
          }
          className="reciclo-input"
        >
          {TIPOS_RESIDUO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo === 'todos' ? 'Todos los tipos de residuo' : tipo}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de establecimiento */}
      <div>
        <span className="block text-xs font-medium text-[#454B45] mb-1.5">
          Tipo de establecimiento
        </span>
        <div className="grid grid-cols-1 gap-2">
          {TIPOS_ESTABLECIMIENTO.map((tipo) => {
            const activo = filtros.tipoEstablecimiento === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => actualizar('tipoEstablecimiento', tipo)}
                className={`px-3.5 min-h-[44px] text-left text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                  activo
                    ? 'bg-[#F1F5F0] border-[#6E9167] text-[#141714]'
                    : 'bg-white border-[#E4E7E3] text-[#454B45] hover:bg-[#F7F8F6]'
                }`}
              >
                {tipo === 'todos'
                  ? 'Todos los establecimientos'
                  : tipo === 'Comercio local'
                    ? 'Comercios locales'
                    : tipo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distancia en kilómetros */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label
            htmlFor={sinBorde ? 'filtro-distancia-sheet' : 'filtro-distancia'}
            className="text-xs font-medium text-[#454B45]"
          >
            Distancia desde tu rancho
          </label>
          <span className="text-xs font-semibold text-[#6E9167] font-tabular">
            {filtros.distanciaMaxKm === null
              ? 'Sin límite'
              : `Hasta ${filtros.distanciaMaxKm} km`}
          </span>
        </div>

        <p className="text-[11px] text-[#6C736C] mb-2 truncate">
          Referencia: {ganaderoActivo.rancho}
        </p>

        <input
          id={sinBorde ? 'filtro-distancia-sheet' : 'filtro-distancia'}
          type="range"
          min={2}
          max={40}
          step={1}
          value={filtros.distanciaMaxKm ?? 40}
          onChange={(e) => actualizar('distanciaMaxKm', Number(e.target.value))}
          className="w-full h-6 accent-[#6E9167] cursor-pointer"
        />

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {[5, 10, 15, 25].map((km) => {
            const seleccionado = filtros.distanciaMaxKm === km;
            return (
              <button
                key={km}
                type="button"
                onClick={() => actualizar('distanciaMaxKm', km)}
                className={`min-h-[40px] text-xs rounded-xl border font-tabular transition-colors cursor-pointer ${
                  seleccionado
                    ? 'bg-[#6E9167] border-[#6E9167] text-white'
                    : 'bg-white border-[#E4E7E3] text-[#454B45] hover:bg-[#F7F8F6]'
                }`}
              >
                {km} km
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => actualizar('distanciaMaxKm', null)}
            className={`min-h-[40px] text-xs rounded-xl border transition-colors cursor-pointer ${
              filtros.distanciaMaxKm === null
                ? 'bg-[#6E9167] border-[#6E9167] text-white'
                : 'bg-white border-[#E4E7E3] text-[#454B45] hover:bg-[#F7F8F6]'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Precio por kg */}
      <div>
        <span className="block text-xs font-medium text-[#454B45] mb-1.5">
          Precio por kg ($ MXN)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Precio mínimo"
            type="number"
            min={0}
            step="0.5"
            value={filtros.precioMin}
            onChange={(e) => actualizar('precioMin', e.target.value)}
            placeholder="Mínimo"
            className="reciclo-input font-tabular"
          />
          <input
            aria-label="Precio máximo"
            type="number"
            min={0}
            step="0.5"
            value={filtros.precioMax}
            onChange={(e) => actualizar('precioMax', e.target.value)}
            placeholder="Máximo"
            className="reciclo-input font-tabular"
          />
        </div>
      </div>

      {/* Cantidad disponible en kg */}
      <div>
        <span className="block text-xs font-medium text-[#454B45] mb-1.5">
          Cantidad disponible (kg)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Cantidad mínima en kilogramos"
            type="number"
            min={0}
            step={10}
            value={filtros.cantidadMin}
            onChange={(e) => actualizar('cantidadMin', e.target.value)}
            placeholder="Mín. kg"
            className="reciclo-input font-tabular"
          />
          <input
            aria-label="Cantidad máxima en kilogramos"
            type="number"
            min={0}
            step={10}
            value={filtros.cantidadMax}
            onChange={(e) => actualizar('cantidadMax', e.target.value)}
            placeholder="Máx. kg"
            className="reciclo-input font-tabular"
          />
        </div>
      </div>
    </aside>
  );
}
