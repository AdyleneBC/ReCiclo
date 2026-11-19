import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import {
  Comerciante,
  Producto,
  TipoEstablecimiento,
  TipoResiduo,
} from '../types';
import { FOTOS_PRODUCTO_MUESTRA } from '../services/productService';
import { UBICACIONES_DEMO } from '../services/mapService';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductFormProps {
  comercianteActivo: Comerciante;
  productoInicial?: Producto | null;
  onGuardar: (datos: {
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
  }) => void;
  onCancelar: () => void;
}

export function ProductForm({
  comercianteActivo,
  productoInicial,
  onGuardar,
  onCancelar,
}: ProductFormProps) {
  const esEdicion = Boolean(productoInicial);

  const [nombre, setNombre] = useState(productoInicial?.nombre ?? '');
  const [fotografia, setFotografia] = useState(
    productoInicial?.fotografia ?? FOTOS_PRODUCTO_MUESTRA[0].url
  );
  const [precioPorKg, setPrecioPorKg] = useState(
    productoInicial ? String(productoInicial.precioPorKg) : '2.50'
  );
  const [cantidadKg, setCantidadKg] = useState(
    productoInicial ? String(productoInicial.cantidadKg) : '150'
  );
  const [tipoResiduo, setTipoResiduo] = useState<TipoResiduo>(
    productoInicial?.tipoResiduo ?? 'Merma de segunda'
  );
  const [descripcion, setDescripcion] = useState(
    productoInicial?.descripcion ?? ''
  );
  const [tipoEstablecimiento, setTipoEstablecimiento] =
    useState<TipoEstablecimiento>(
      productoInicial?.tipoEstablecimiento ??
        comercianteActivo.tipoEstablecimiento
    );
  const [ubicacion, setUbicacion] = useState(
    productoInicial?.ubicacion ?? comercianteActivo.ubicacion
  );
  const [latitud, setLatitud] = useState(
    productoInicial?.latitud ?? comercianteActivo.coordenadas.lat
  );
  const [longitud, setLongitud] = useState(
    productoInicial?.longitud ?? comercianteActivo.coordenadas.lng
  );
  const [error, setError] = useState<string | null>(null);

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotografia(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const manejarSeleccionZona = (etiqueta: string) => {
    const zona = UBICACIONES_DEMO.find((u) => u.etiqueta === etiqueta);
    if (!zona) return;
    setUbicacion(zona.ubicacion);
    setTipoEstablecimiento(zona.tipo);
    setLatitud(zona.coordenadas.lat);
    setLongitud(zona.coordenadas.lng);
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const precio = Number(precioPorKg);
    const cant = Number(cantidadKg);

    if (!nombre.trim()) {
      setError('Ingresa el nombre del producto.');
      return;
    }
    if (Number.isNaN(precio) || precio <= 0) {
      setError('El precio por kilogramo debe ser mayor a $0.');
      return;
    }
    if (Number.isNaN(cant) || cant <= 0) {
      setError('La cantidad disponible debe ser mayor a 0 kg.');
      return;
    }
    if (!descripcion.trim()) {
      setError('Agrega una breve descripción de estado y manejo del producto.');
      return;
    }
    if (!ubicacion.trim()) {
      setError('Indica la ubicación del establecimiento.');
      return;
    }

    onGuardar({
      nombre,
      fotografia,
      precioPorKg: precio,
      cantidadKg: cant,
      tipoResiduo,
      descripcion,
      tipoEstablecimiento,
      ubicacion,
      latitud,
      longitud,
    });
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="reciclo-card p-4 sm:p-6 space-y-5 max-w-4xl"
    >
      <div className="border-b border-[#E4E7E3] pb-3.5">
        <h2 className="font-display text-lg font-bold text-[#141714]">
          {esEdicion ? 'Editar publicación' : 'Agregar producto a la venta'}
        </h2>
        <p className="text-xs text-[#6C736C] mt-1">
          {esEdicion
            ? 'Actualiza los datos de tu publicación. Los cambios se reflejarán de inmediato para los ganaderos.'
            : 'Publica excedentes o mermas limpias para que los ganaderos puedan encontrarlos y negociar contigo.'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#700808]/30 text-xs text-[#700808]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5 space-y-3">
          <span className="block text-xs font-medium text-[#454B45]">
            Fotografía del producto
          </span>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E4E7E3] bg-[#F7F8F6]">
            <ImageWithFallback
              src={fotografia}
              alt={nombre || 'Vista previa del producto'}
              className="w-full h-full object-cover"
            />
          </div>

          <label className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 min-h-[44px] text-xs font-medium border border-[#E4E7E3] rounded-xl bg-white hover:border-[#6E9167] cursor-pointer">
            <Camera className="w-4 h-4 text-[#6E9167]" />
            <span>Subir fotografía propia</span>
            <input
              type="file"
              accept="image/*"
              onChange={manejarArchivo}
              className="hidden"
            />
          </label>

          <div>
            <span className="block text-[11px] text-[#6C736C] mb-1.5">
              O elegir fotografía de referencia:
            </span>
            <div className="grid grid-cols-5 gap-2">
              {FOTOS_PRODUCTO_MUESTRA.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => setFotografia(item.url)}
                  title={item.etiqueta}
                  className={`h-12 rounded-lg overflow-hidden border cursor-pointer ${
                    fotografia === item.url
                      ? 'border-[#6E9167] ring-2 ring-[#6E9167]'
                      : 'border-[#E4E7E3]'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.etiqueta}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <div>
            <label
              htmlFor="form-nombre"
              className="block text-xs font-medium text-[#454B45] mb-1"
            >
              Nombre del producto
            </label>
            <input
              id="form-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Verduras de segunda (Calabacita y chayote)"
              className="reciclo-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="form-precio"
                className="block text-xs font-medium text-[#454B45] mb-1"
              >
                Precio (MXN / kg)
              </label>
              <input
                id="form-precio"
                type="number"
                min="0.1"
                step="0.1"
                required
                value={precioPorKg}
                onChange={(e) => setPrecioPorKg(e.target.value)}
                className="reciclo-input font-tabular"
              />
            </div>

            <div>
              <label
                htmlFor="form-cantidad"
                className="block text-xs font-medium text-[#454B45] mb-1"
              >
                Cantidad (kg)
              </label>
              <input
                id="form-cantidad"
                type="number"
                min="1"
                step="1"
                required
                value={cantidadKg}
                onChange={(e) => setCantidadKg(e.target.value)}
                className="reciclo-input font-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="form-residuo"
                className="block text-xs font-medium text-[#454B45] mb-1"
              >
                Tipo de residuo
              </label>
              <select
                id="form-residuo"
                value={tipoResiduo}
                onChange={(e) => setTipoResiduo(e.target.value as TipoResiduo)}
                className="reciclo-input"
              >
                <option value="Merma de segunda">Merma de segunda</option>
                <option value="Desperdicio limpio">Desperdicio limpio</option>
                <option value="Desecho orgánico mezclado">
                  Desecho orgánico mezclado
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="form-establecimiento"
                className="block text-xs font-medium text-[#454B45] mb-1"
              >
                Tipo de establecimiento
              </label>
              <select
                id="form-establecimiento"
                value={tipoEstablecimiento}
                onChange={(e) =>
                  setTipoEstablecimiento(e.target.value as TipoEstablecimiento)
                }
                className="reciclo-input"
              >
                <option value="Central de Abastos">Central de Abastos</option>
                <option value="Comercio local">Comercio local</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="form-descripcion"
              className="block text-xs font-medium text-[#454B45] mb-1"
            >
              Descripción
            </label>
            <textarea
              id="form-descripcion"
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe estado de madurez, empaque, horario de recolección o condiciones."
              className="reciclo-input resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="form-ubicacion"
                className="text-xs font-medium text-[#454B45]"
              >
                Ubicación del establecimiento
              </label>
              <select
                aria-label="Seleccionar zona de referencia en el mapa"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) manejarSeleccionZona(e.target.value);
                }}
                className="text-xs border border-[#E4E7E3] rounded-lg px-2.5 min-h-[36px] text-[#454B45] bg-white"
              >
                <option value="">Punto regional rápido...</option>
                {UBICACIONES_DEMO.map((u) => (
                  <option key={u.etiqueta} value={u.etiqueta}>
                    {u.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <input
              id="form-ubicacion"
              type="text"
              required
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="reciclo-input"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E4E7E3] grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-3">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 min-h-[44px] text-sm font-medium rounded-xl border border-[#E4E7E3] bg-white text-[#454B45] hover:text-[#141714] hover:bg-[#F7F8F6] cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="reciclo-btn-primary px-5 text-sm font-semibold rounded-xl cursor-pointer"
        >
          {esEdicion ? 'Guardar cambios' : 'Publicar producto'}
        </button>
      </div>
    </form>
  );
}
