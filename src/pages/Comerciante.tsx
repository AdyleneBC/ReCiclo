import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  MessageSquare,
  Pencil,
  Plus,
  Tractor,
  Trash2,
} from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import { Producto } from '../types';
import { ProductForm } from '../components/ProductForm';
import { ImageWithFallback } from '../components/ImageWithFallback';

type SeccionComerciante = 'en-venta' | 'agregar' | 'vendidos';

export function Comerciante() {
  const {
    setRolActivo,
    comerciantes,
    comercianteActivoId,
    setComercianteActivoId,
    comercianteActivo,
    productos,
    conversaciones,
    ventasHistorial,
    publicarProducto,
    actualizarProducto,
    eliminarProducto,
    marcarProductoVendido,
    setChatAbierto,
    seleccionarConversacion,
  } = useReCiclo();

  const [seccion, setSeccion] = useState<SeccionComerciante>('en-venta');
  const [productoEditando, setProductoEditando] = useState<Producto | null>(
    null
  );
  const [productoConfirmEliminar, setProductoConfirmEliminar] = useState<
    string | null
  >(null);
  const [ajusteRapidoId, setAjusteRapidoId] = useState<string | null>(null);
  const [precioRapido, setPrecioRapido] = useState('');
  const [cantidadRapida, setCantidadRapida] = useState('');

  useEffect(() => {
    setRolActivo('comerciante');
  }, [setRolActivo]);

  const productosEnVenta = useMemo(
    () =>
      productos.filter(
        (p) =>
          p.comercianteId === comercianteActivoId &&
          p.estado === 'disponible' &&
          p.cantidadKg > 0
      ),
    [productos, comercianteActivoId]
  );

  const ventasComerciante = useMemo(
    () =>
      ventasHistorial.filter((v) => v.comercianteId === comercianteActivoId),
    [ventasHistorial, comercianteActivoId]
  );

  const conversacionesComerciante = useMemo(
    () =>
      conversaciones.filter((c) => c.comercianteId === comercianteActivoId),
    [conversaciones, comercianteActivoId]
  );

  const ofertasPendientes = useMemo(() => {
    return conversacionesComerciante.reduce((acc, conv) => {
      const pend = conv.ofertas.filter((o) => o.estado === 'pendiente').length;
      return acc + pend;
    }, 0);
  }, [conversacionesComerciante]);

  const abrirAjusteRapido = (prod: Producto) => {
    setAjusteRapidoId(prod.id);
    setPrecioRapido(String(prod.precioPorKg));
    setCantidadRapida(String(prod.cantidadKg));
  };

  const guardarAjusteRapido = (productoId: string) => {
    const p = Number(precioRapido);
    const c = Number(cantidadRapida);
    if (Number.isNaN(p) || p <= 0 || Number.isNaN(c) || c < 0) return;
    actualizarProducto(productoId, { precioPorKg: p, cantidadKg: c });
    setAjusteRapidoId(null);
  };

  const cambiarFotoDirecta = (
    productoId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        actualizarProducto(productoId, { fotografia: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const abrirPrimeraConversacionConOferta = () => {
    const convConOferta =
      conversacionesComerciante.find((c) =>
        c.ofertas.some((o) => o.estado === 'pendiente')
      ) ?? conversacionesComerciante[0];
    if (convConOferta) {
      seleccionarConversacion(convConOferta.id);
    }
    setChatAbierto(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 lg:pb-6 border-b border-[#E4E7E3]">
        <div>
          <p className="text-xs font-medium text-[#CC4E00]">
            Vista del Comerciante · Perfil de demostración
          </p>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#141714] mt-0.5">
            Panel de administración
          </h1>
          <p className="text-xs sm:text-sm text-[#454B45] mt-0.5">
            {comercianteActivo.nombreEstablecimiento} ·{' '}
            {comercianteActivo.ubicacion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label
              htmlFor="select-comerciante-activo"
              className="text-xs font-medium text-[#454B45] whitespace-nowrap hidden sm:inline"
            >
              Comercio:
            </label>
            <select
              id="select-comerciante-activo"
              value={comercianteActivoId}
              onChange={(e) => {
                setComercianteActivoId(e.target.value);
                setProductoEditando(null);
              }}
              className="reciclo-input py-2 text-xs min-w-[200px]"
            >
              {comerciantes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.nombreEstablecimiento}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={abrirPrimeraConversacionConOferta}
            className="inline-flex items-center justify-center gap-2 px-3.5 min-h-[44px] text-xs font-semibold rounded-xl border border-[#FF8030] bg-[#FFF3EB] text-[#CC4E00] hover:bg-[#FF8030] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              Ofertas{ofertasPendientes > 0 ? ` (${ofertasPendientes})` : ''}
            </span>
          </button>

          <Link
            to="/ganadero"
            onClick={() => setRolActivo('ganadero')}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 min-h-[44px] text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] transition-colors whitespace-nowrap shrink-0"
          >
            <Tractor className="w-3.5 h-3.5 text-[#6E9167]" />
            <span>Cambiar a Ganadero</span>
          </Link>
        </div>
      </div>

      {/* Tres botones principales centralizados: En venta, Agregar producto, Vendidos */}
      <div className="mt-5 flex justify-center">
        <div
          role="tablist"
          aria-label="Secciones de administración de productos"
          className="w-full max-w-2xl grid grid-cols-3 gap-1.5 p-1.5 bg-[#F7F8F6] border border-[#E4E7E3] rounded-2xl"
        >
          <button
            type="button"
            role="tab"
            aria-selected={seccion === 'en-venta' && !productoEditando}
            onClick={() => {
              setSeccion('en-venta');
              setProductoEditando(null);
            }}
            className={`min-h-[46px] px-2 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              seccion === 'en-venta' && !productoEditando
                ? 'bg-[#6E9167] text-white shadow-xs'
                : 'text-[#454B45] hover:text-[#141714] hover:bg-white/70'
            }`}
          >
            <span>En venta</span>
            <span className="font-tabular opacity-90">
              ({productosEnVenta.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={seccion === 'agregar'}
            onClick={() => {
              setSeccion('agregar');
              setProductoEditando(null);
            }}
            className={`min-h-[46px] px-2 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              seccion === 'agregar'
                ? 'bg-[#6E9167] text-white shadow-xs'
                : 'text-[#454B45] hover:text-[#141714] hover:bg-white/70'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Agregar producto</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={seccion === 'vendidos'}
            onClick={() => {
              setSeccion('vendidos');
              setProductoEditando(null);
            }}
            className={`min-h-[46px] px-2 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              seccion === 'vendidos'
                ? 'bg-[#6E9167] text-white shadow-xs'
                : 'text-[#454B45] hover:text-[#141714] hover:bg-white/70'
            }`}
          >
            <span>Vendidos</span>
            <span className="font-tabular opacity-90">
              ({ventasComerciante.length})
            </span>
          </button>
        </div>
      </div>

      {/* Contenido del apartado activo */}
      <div className="mt-6">
        {productoEditando ? (
          <div className="flex justify-center">
            <ProductForm
              comercianteActivo={comercianteActivo}
              productoInicial={productoEditando}
              onGuardar={(datos) => {
                actualizarProducto(productoEditando.id, datos);
                setProductoEditando(null);
                setSeccion('en-venta');
              }}
              onCancelar={() => setProductoEditando(null)}
            />
          </div>
        ) : seccion === 'agregar' ? (
          <div className="flex justify-center">
            <ProductForm
              comercianteActivo={comercianteActivo}
              onGuardar={(datos) => {
                publicarProducto(datos);
                setSeccion('en-venta');
              }}
              onCancelar={() => setSeccion('en-venta')}
            />
          </div>
        ) : seccion === 'en-venta' ? (
          productosEnVenta.length === 0 ? (
            <div className="reciclo-card p-8 sm:p-10 text-center space-y-3 max-w-2xl mx-auto">
              <p className="font-display text-base font-semibold text-[#141714]">
                No tienes productos activos en venta
              </p>
              <p className="text-sm text-[#454B45] max-w-md mx-auto">
                Publica tus excedentes del día para que los ganaderos cercanos
                puedan ubicarlos y negociar contigo.
              </p>
              <button
                type="button"
                onClick={() => setSeccion('agregar')}
                className="reciclo-btn-primary inline-flex items-center gap-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar primer producto</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {productosEnVenta.map((prod) => (
                <article
                  key={prod.id}
                  className="reciclo-card overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-[#F7F8F6] border-b border-[#E4E7E3]">
                      <ImageWithFallback
                        src={prod.fotografia}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                      />
                      <label
                        title="Cambiar fotografía"
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 min-h-[40px] text-xs font-medium bg-white/95 text-[#141714] border border-[#E4E7E3] rounded-xl hover:border-[#6E9167] cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#6E9167]" />
                        <span>Cambiar foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => cambiarFotoDirecta(prod.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#6C736C] truncate">
                          {prod.tipoResiduo}
                        </span>
                        <span className="font-semibold text-[#6E9167] shrink-0">
                          Disponible
                        </span>
                      </div>

                      <h3 className="mt-1 font-display text-base font-semibold text-[#141714] line-clamp-2">
                        {prod.nombre}
                      </h3>

                      {ajusteRapidoId === prod.id ? (
                        <div className="mt-3 p-3 rounded-xl bg-[#F7F8F6] border border-[#E4E7E3] space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-[#454B45] block mb-0.5">
                                Precio ($/kg)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={precioRapido}
                                onChange={(e) =>
                                  setPrecioRapido(e.target.value)
                                }
                                className="reciclo-input text-xs font-tabular"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-[#454B45] block mb-0.5">
                                Cantidad (kg)
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                value={cantidadRapida}
                                onChange={(e) =>
                                  setCantidadRapida(e.target.value)
                                }
                                className="reciclo-input text-xs font-tabular"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => guardarAjusteRapido(prod.id)}
                              className="reciclo-btn-primary flex-1 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                              Aplicar
                            </button>
                            <button
                              type="button"
                              onClick={() => setAjusteRapidoId(null)}
                              className="px-3 min-h-[44px] text-xs border border-[#E4E7E3] bg-white rounded-xl cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-baseline justify-between gap-2 pb-3 border-b border-[#E4E7E3]">
                          <span className="font-display text-lg font-bold text-[#141714] font-tabular">
                            ${prod.precioPorKg.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-[#6C736C]">
                              / kg
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-[#6E9167] font-tabular">
                            {prod.cantidadKg} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProductoEditando(prod)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#6E9167]" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirAjusteRapido(prod)}
                        className="inline-flex items-center justify-center px-3 min-h-[44px] text-xs font-medium rounded-xl border border-[#E4E7E3] bg-white text-[#454B45] hover:bg-[#F7F8F6] cursor-pointer"
                      >
                        Precio / kg
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => marcarProductoVendido(prod.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold rounded-xl border border-[#6E9167] bg-[#F1F5F0] text-[#141714] hover:bg-[#6E9167] hover:text-white transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Vendido</span>
                      </button>

                      {productoConfirmEliminar === prod.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            eliminarProducto(prod.id);
                            setProductoConfirmEliminar(null);
                          }}
                          className="reciclo-btn-danger inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          <span>Confirmar baja</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setProductoConfirmEliminar(prod.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold rounded-xl border border-[#700808]/30 bg-white text-[#700808] hover:bg-[#FDF2F2] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : ventasComerciante.length === 0 ? (
          <div className="reciclo-card p-8 sm:p-10 text-center space-y-2 max-w-2xl mx-auto">
            <p className="font-display text-base font-semibold text-[#141714]">
              Aún no hay operaciones registradas en el historial
            </p>
            <p className="text-sm text-[#454B45]">
              Cuando aceptes una oferta económica o de trueque, o marques un
              lote como vendido, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {ventasComerciante.map((venta) => (
              <article key={venta.id} className="reciclo-card overflow-hidden">
                <div className="aspect-[4/3] bg-[#F7F8F6] border-b border-[#E4E7E3]">
                  <ImageWithFallback
                    src={venta.fotografia}
                    alt={venta.nombreProducto}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        venta.tipoNegociacion === 'trueque'
                          ? 'text-[#CC4E00]'
                          : 'text-[#6E9167]'
                      }`}
                    >
                      {venta.tipoNegociacion === 'trueque'
                        ? 'Trueque'
                        : 'Compra'}
                    </span>
                    <span className="text-[#6C736C] font-tabular">
                      {venta.fecha}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-[#141714]">
                    {venta.nombreProducto}
                  </h3>

                  <div className="pt-2 border-t border-[#E4E7E3] space-y-1 text-xs text-[#454B45]">
                    <div className="flex justify-between gap-2">
                      <span className="text-[#6C736C]">
                        Cantidad entregada:
                      </span>
                      <span className="font-semibold text-[#141714] font-tabular">
                        {venta.cantidadVendidaKg} kg
                      </span>
                    </div>
                    {venta.tipoNegociacion === 'compra' &&
                    venta.precioFinalPorKg !== undefined ? (
                      <div className="flex justify-between gap-2">
                        <span className="text-[#6C736C]">Precio final:</span>
                        <span className="font-semibold text-[#141714] font-tabular">
                          ${venta.precioFinalPorKg.toFixed(2)}/kg
                          {venta.totalPagado !== undefined
                            ? ` ($${venta.totalPagado.toFixed(2)})`
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between gap-2">
                        <span className="text-[#6C736C]">Intercambio:</span>
                        <span className="font-semibold text-[#141714] text-right">
                          {venta.detalleTrueque}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-[#6C736C]">Ganadero:</span>
                      <span className="font-medium text-[#141714]">
                        {venta.ganaderoNombre}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
