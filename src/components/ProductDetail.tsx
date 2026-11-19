import React, { useState } from 'react';
import {
  Camera,
  Check,
  MapPin,
  MessageSquare,
  Repeat,
  Tag,
  X,
} from 'lucide-react';
import { Comerciante, Producto } from '../types';
import { useReCiclo } from '../context/ReCicloContext';
import { FOTOS_PRODUCTO_MUESTRA } from '../services/productService';
import { formatearDistancia } from '../services/mapService';
import { AvatarUsuario } from './AvatarUsuario';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductDetailProps {
  producto: Producto;
  comerciante?: Comerciante;
  distanciaKm?: number;
  onCerrar: () => void;
  onContactar: () => void;
}

export function ProductDetail({
  producto,
  comerciante,
  distanciaKm,
  onCerrar,
  onContactar,
}: ProductDetailProps) {
  const {
    actualizarProducto,
    enviarOfertaEconomica,
    enviarOfertaTrueque,
    setChatAbierto,
  } = useReCiclo();

  const [tabOferta, setTabOferta] = useState<'economica' | 'trueque'>(
    'economica'
  );
  const [mostrarSelectorFoto, setMostrarSelectorFoto] = useState(false);

  const [precioPropuesto, setPrecioPropuesto] = useState<string>(
    Math.max(0.5, Number((producto.precioPorKg * 0.85).toFixed(2))).toString()
  );
  const [cantidadEcoKg, setCantidadEcoKg] = useState<string>(
    Math.min(100, producto.cantidadKg).toString()
  );
  const [mensajeEco, setMensajeEco] = useState('');

  const [productoOfrecido, setProductoOfrecido] = useState('');
  const [cantidadOfrecida, setCantidadOfrecida] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('kg');
  const [descripcionTrueque, setDescripcionTrueque] = useState('');
  const [cantidadTruequeKg, setCantidadTruequeKg] = useState<string>(
    Math.min(80, producto.cantidadKg).toString()
  );

  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  const manejarSubidaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        actualizarProducto(producto.id, { fotografia: reader.result });
        setMostrarSelectorFoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const manejarEnviarEconomica = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    const precioNum = Number(precioPropuesto);
    const cantNum = Number(cantidadEcoKg);

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      setErrorForm('Ingresa un precio propuesto válido mayor a $0.');
      return;
    }
    if (precioNum >= producto.precioPorKg) {
      setErrorForm(
        `La oferta económica debe ser menor al precio original ($${producto.precioPorKg.toFixed(2)} MXN/kg).`
      );
      return;
    }
    if (
      Number.isNaN(cantNum) ||
      cantNum <= 0 ||
      cantNum > producto.cantidadKg
    ) {
      setErrorForm(
        `La cantidad solicitada debe estar entre 1 y ${producto.cantidadKg} kg.`
      );
      return;
    }

    enviarOfertaEconomica({
      productoId: producto.id,
      precioPropuesto: precioNum,
      cantidadSolicitadaKg: cantNum,
      mensajeOpcional: mensajeEco,
    });

    setConfirmacion(
      'Oferta económica enviada al chat del comerciante. El precio publicado no se modificó.'
    );
    setChatAbierto(true);
    onCerrar();
  };

  const manejarEnviarTrueque = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    const cantOfrecidaNum = Number(cantidadOfrecida);
    const cantSolicitadaNum = Number(cantidadTruequeKg);

    if (!productoOfrecido.trim()) {
      setErrorForm('Indica el nombre del producto que ofreces en trueque.');
      return;
    }
    if (Number.isNaN(cantOfrecidaNum) || cantOfrecidaNum <= 0) {
      setErrorForm('Indica una cantidad ofrecida válida.');
      return;
    }
    if (
      Number.isNaN(cantSolicitadaNum) ||
      cantSolicitadaNum <= 0 ||
      cantSolicitadaNum > producto.cantidadKg
    ) {
      setErrorForm(
        `La cantidad que deseas recibir debe estar entre 1 y ${producto.cantidadKg} kg.`
      );
      return;
    }

    enviarOfertaTrueque({
      productoId: producto.id,
      productoOfrecido,
      cantidadOfrecida: cantOfrecidaNum,
      unidadMedida,
      descripcionTrueque,
      cantidadSolicitadaKg: cantSolicitadaNum,
    });

    setConfirmacion('Propuesta de trueque enviada al chat del comerciante.');
    setChatAbierto(true);
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-producto-titulo"
    >
      <div className="bg-white border border-[#E4E7E3] rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl reciclo-sheet-enter">
        {/* Indicador táctil de hoja en móvil */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#CFD5CD]" />
        </div>

        {/* Barra superior del modal */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E4E7E3] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-[#6E9167] font-medium truncate">
              {producto.tipoResiduo} · {producto.tipoEstablecimiento}
            </p>
            <h2
              id="detalle-producto-titulo"
              className="font-display text-base sm:text-lg font-bold text-[#141714] truncate"
            >
              {producto.nombre}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle del producto"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#454B45] hover:text-[#141714] hover:bg-[#F7F8F6] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#E4E7E3] aspect-[4/3] bg-[#F7F8F6]">
              <ImageWithFallback
                src={producto.fotografia}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setMostrarSelectorFoto((v) => !v)}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 min-h-[40px] text-xs font-medium bg-white/95 text-[#141714] border border-[#E4E7E3] rounded-xl hover:border-[#6E9167] shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#6E9167]" />
                <span>Editar foto</span>
              </button>
            </div>

            {mostrarSelectorFoto && (
              <div className="p-3.5 rounded-2xl border border-[#E4E7E3] bg-[#F7F8F6] space-y-2.5">
                <p className="text-xs font-medium text-[#141714]">
                  Cambiar fotografía de demostración
                </p>
                <label className="inline-flex items-center min-h-[40px] px-3.5 text-xs font-medium bg-white border border-[#E4E7E3] rounded-xl hover:border-[#6E9167] cursor-pointer">
                  Subir imagen desde dispositivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={manejarSubidaFoto}
                    className="hidden"
                  />
                </label>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {FOTOS_PRODUCTO_MUESTRA.map((foto) => (
                    <button
                      key={foto.url}
                      type="button"
                      onClick={() => {
                        actualizarProducto(producto.id, {
                          fotografia: foto.url,
                        });
                        setMostrarSelectorFoto(false);
                      }}
                      title={foto.etiqueta}
                      className={`h-12 rounded-lg overflow-hidden border cursor-pointer ${
                        producto.fotografia === foto.url
                          ? 'border-[#6E9167] ring-2 ring-[#6E9167]'
                          : 'border-[#E4E7E3]'
                      }`}
                    >
                      <img
                        src={foto.url}
                        alt={foto.etiqueta}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-[#E4E7E3] bg-[#F7F8F6]">
              <div>
                <span className="text-xs text-[#6C736C] block">
                  Precio establecido
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-[#141714] font-tabular">
                  ${producto.precioPorKg.toFixed(2)}
                </span>
                <span className="text-xs text-[#6C736C] ml-1">MXN / kg</span>
              </div>
              <div>
                <span className="text-xs text-[#6C736C] block">
                  Disponibilidad
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-[#6E9167] font-tabular">
                  {producto.cantidadKg} kg
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#141714]">
                Descripción del producto
              </h3>
              <p className="mt-1.5 text-sm text-[#454B45] leading-relaxed">
                {producto.descripcion}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#E4E7E3] space-y-3">
              <div className="flex items-center gap-3">
                <AvatarUsuario
                  nombre={comerciante?.nombre ?? 'Comerciante'}
                  foto={comerciante?.fotografiaPerfil}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-[#141714] truncate">
                    {comerciante?.nombre ?? 'Comerciante'}
                  </p>
                  <p className="text-xs text-[#454B45] truncate">
                    {comerciante?.nombreEstablecimiento}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#454B45]">
                <MapPin className="w-4 h-4 text-[#6E9167] shrink-0 mt-0.5" />
                <span>
                  {producto.ubicacion}
                  {distanciaKm !== undefined &&
                    ` (${formatearDistancia(distanciaKm)} de tu rancho)`}
                </span>
              </div>

              <button
                type="button"
                onClick={onContactar}
                className="reciclo-btn-primary w-full inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contactar vendedor por chat</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-[#E4E7E3] rounded-2xl p-4 sm:p-5">
              <h3 className="font-display text-base font-bold text-[#141714]">
                Enviar una oferta al comerciante
              </h3>
              <p className="mt-1 text-xs text-[#6C736C]">
                El precio original de la publicación permanece intacto; tu
                propuesta llegará como tarjeta de oferta dentro del chat.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-[#F7F8F6] rounded-xl border border-[#E4E7E3]">
                <button
                  type="button"
                  onClick={() => {
                    setTabOferta('economica');
                    setErrorForm(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    tabOferta === 'economica'
                      ? 'bg-white text-[#141714] shadow-xs border border-[#E4E7E3]'
                      : 'text-[#454B45] hover:text-[#141714]'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-[#6E9167]" />
                  <span>Oferta económica</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTabOferta('trueque');
                    setErrorForm(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    tabOferta === 'trueque'
                      ? 'bg-white text-[#141714] shadow-xs border border-[#E4E7E3]'
                      : 'text-[#454B45] hover:text-[#141714]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5 text-[#CC4E00]" />
                  <span>Oferta de trueque</span>
                </button>
              </div>

              {errorForm && (
                <div className="mt-4 p-3 rounded-xl bg-[#FDF2F2] border border-[#700808]/30 text-xs text-[#700808]">
                  {errorForm}
                </div>
              )}

              {confirmacion && (
                <div className="mt-4 p-3 rounded-xl bg-[#F1F5F0] border border-[#6E9167]/40 text-xs text-[#141714] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6E9167] shrink-0" />
                  <span>{confirmacion}</span>
                </div>
              )}

              {tabOferta === 'economica' ? (
                <form
                  onSubmit={manejarEnviarEconomica}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#454B45] mb-1">
                      Precio original del comerciante
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$${producto.precioPorKg.toFixed(2)} MXN / kg`}
                      className="reciclo-input bg-[#F7F8F6] text-[#6C736C] font-tabular cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="eco-precio"
                        className="block text-xs font-medium text-[#454B45] mb-1"
                      >
                        Precio propuesto (MXN / kg)
                      </label>
                      <input
                        id="eco-precio"
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={precioPropuesto}
                        onChange={(e) => setPrecioPropuesto(e.target.value)}
                        className="reciclo-input font-tabular"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="eco-cantidad"
                        className="block text-xs font-medium text-[#454B45] mb-1"
                      >
                        Cantidad (kg)
                      </label>
                      <input
                        id="eco-cantidad"
                        type="number"
                        min="1"
                        max={producto.cantidadKg}
                        required
                        value={cantidadEcoKg}
                        onChange={(e) => setCantidadEcoKg(e.target.value)}
                        className="reciclo-input font-tabular"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="eco-mensaje"
                      className="block text-xs font-medium text-[#454B45] mb-1"
                    >
                      Mensaje opcional
                    </label>
                    <textarea
                      id="eco-mensaje"
                      rows={3}
                      value={mensajeEco}
                      onChange={(e) => setMensajeEco(e.target.value)}
                      placeholder="Ej. Puedo recoger hoy por la tarde con rejas propias."
                      className="reciclo-input resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="reciclo-btn-primary w-full px-4 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Enviar oferta económica
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={manejarEnviarTrueque}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="trueque-producto"
                      className="block text-xs font-medium text-[#454B45] mb-1"
                    >
                      Producto propio que ofreces
                    </label>
                    <input
                      id="trueque-producto"
                      type="text"
                      required
                      value={productoOfrecido}
                      onChange={(e) => setProductoOfrecido(e.target.value)}
                      placeholder="Ej. Queso fresco artesanal, leche bronca, composta..."
                      className="reciclo-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="trueque-cant-ofrecida"
                        className="block text-xs font-medium text-[#454B45] mb-1"
                      >
                        Cantidad ofrecida
                      </label>
                      <input
                        id="trueque-cant-ofrecida"
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        value={cantidadOfrecida}
                        onChange={(e) => setCantidadOfrecida(e.target.value)}
                        placeholder="Ej. 10"
                        className="reciclo-input font-tabular"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="trueque-unidad"
                        className="block text-xs font-medium text-[#454B45] mb-1"
                      >
                        Unidad
                      </label>
                      <select
                        id="trueque-unidad"
                        value={unidadMedida}
                        onChange={(e) => setUnidadMedida(e.target.value)}
                        className="reciclo-input"
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="litros">Litros</option>
                        <option value="piezas">Piezas</option>
                        <option value="costales">Costales</option>
                        <option value="pacas">Pacas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="trueque-cant-recibir"
                      className="block text-xs font-medium text-[#454B45] mb-1"
                    >
                      Cantidad del comerciante a recibir (kg)
                    </label>
                    <input
                      id="trueque-cant-recibir"
                      type="number"
                      min="1"
                      max={producto.cantidadKg}
                      required
                      value={cantidadTruequeKg}
                      onChange={(e) => setCantidadTruequeKg(e.target.value)}
                      className="reciclo-input font-tabular"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="trueque-desc"
                      className="block text-xs font-medium text-[#454B45] mb-1"
                    >
                      Descripción opcional del intercambio
                    </label>
                    <textarea
                      id="trueque-desc"
                      rows={3}
                      value={descripcionTrueque}
                      onChange={(e) => setDescripcionTrueque(e.target.value)}
                      placeholder="Detalla frescura, empaque o fecha de entrega."
                      className="reciclo-input resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="reciclo-btn-orange w-full px-4 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Enviar propuesta de trueque
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
