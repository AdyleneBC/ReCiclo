import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import { PRIMER_MENSAJE_SUGERIDO } from '../services/chatService';
import { AvatarUsuario } from './AvatarUsuario';
import { OfferCard } from './OfferCard';

export function Chat() {
  const {
    rolActivo,
    comerciantes,
    ganaderos,
    productos,
    conversaciones,
    comercianteActivoId,
    ganaderoActivoId,
    comercianteActivo,
    ganaderoActivo,
    chatAbierto,
    setChatAbierto,
    conversacionActivaId,
    seleccionarConversacion,
    enviarMensaje,
    responderOferta,
  } = useReCiclo();

  const [texto, setTexto] = useState('');
  const [mostrandoHiloMovil, setMostrandoHiloMovil] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const finChatRef = useRef<HTMLDivElement | null>(null);

  const usuarioActivoId =
    rolActivo === 'ganadero' ? ganaderoActivoId : comercianteActivoId;

  const conversacionesDelRol = useMemo(() => {
    return conversaciones.filter((c) =>
      rolActivo === 'ganadero'
        ? c.ganaderoId === ganaderoActivoId
        : c.comercianteId === comercianteActivoId
    );
  }, [conversaciones, rolActivo, ganaderoActivoId, comercianteActivoId]);

  const conversacionActiva = useMemo(() => {
    const porId = conversacionesDelRol.find(
      (c) => c.id === conversacionActivaId
    );
    return porId ?? conversacionesDelRol[0] ?? null;
  }, [conversacionesDelRol, conversacionActivaId]);

  useEffect(() => {
    if (chatAbierto && conversacionActivaId) {
      setMostrandoHiloMovil(true);
    }
  }, [chatAbierto, conversacionActivaId]);

  useEffect(() => {
    if (chatAbierto && finChatRef.current) {
      finChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatAbierto, conversacionActiva?.mensajes.length, mostrandoHiloMovil]);

  if (!chatAbierto) return null;

  const obtenerContraparte = (convComId: string, convGanId: string) => {
    if (rolActivo === 'ganadero') {
      const c = comerciantes.find((item) => item.id === convComId);
      return {
        nombre: c?.nombre ?? 'Comerciante',
        subtitulo: c?.nombreEstablecimiento ?? '',
        foto: c?.fotografiaPerfil ?? '',
      };
    }
    const g = ganaderos.find((item) => item.id === convGanId);
    return {
      nombre: g?.nombre ?? 'Ganadero',
      subtitulo: g?.rancho ?? '',
      foto: g?.fotografiaPerfil ?? '',
    };
  };

  const manejarEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversacionActiva || !texto.trim()) return;
    enviarMensaje(conversacionActiva.id, texto);
    setTexto('');
  };

  const manejarContraoferta = () => {
    setTexto('Te propongo ajustar condiciones: ');
    inputRef.current?.focus();
  };

  const productoActivo = conversacionActiva
    ? productos.find((p) => p.id === conversacionActiva.productoId)
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end md:items-center justify-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sistema de mensajes y ofertas"
    >
      <div className="bg-white border border-[#E4E7E3] rounded-t-3xl md:rounded-2xl w-full max-w-5xl h-[92vh] md:h-[88vh] flex flex-col overflow-hidden shadow-2xl reciclo-sheet-enter">
        {/* Indicador superior de hoja en móvil */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#CFD5CD]" />
        </div>

        {/* Barra superior del chat */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#E4E7E3] flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {mostrandoHiloMovil && conversacionActiva ? (
              <button
                type="button"
                onClick={() => setMostrandoHiloMovil(false)}
                aria-label="Volver a conversaciones"
                className="md:hidden min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-[#141714] hover:bg-[#F7F8F6] cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <MessageSquare className="w-5 h-5 text-[#6E9167] shrink-0" />
            )}

            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-[#141714] truncate">
                {mostrandoHiloMovil && conversacionActiva
                  ? obtenerContraparte(
                      conversacionActiva.comercianteId,
                      conversacionActiva.ganaderoId
                    ).nombre
                  : 'Mensajes y negociaciones'}
              </h2>
              <p className="text-xs text-[#6C736C] truncate">
                {rolActivo === 'ganadero'
                  ? `${ganaderoActivo.nombre} (${ganaderoActivo.rancho})`
                  : `${comercianteActivo.nombre} (${comercianteActivo.nombreEstablecimiento})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setChatAbierto(false)}
            aria-label="Cerrar mensajes"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#454B45] hover:text-[#141714] hover:bg-[#F7F8F6] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo: Maestro-detalle en móvil, 2 columnas en escritorio */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          {/* Lista de conversaciones */}
          <div
            className={`${
              mostrandoHiloMovil ? 'hidden md:block' : 'block'
            } md:col-span-4 border-r border-[#E4E7E3] overflow-y-auto bg-[#F7F8F6]`}
          >
            {conversacionesDelRol.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6C736C]">
                Aún no tienes conversaciones activas en este perfil. Selecciona
                un producto para contactar a un comerciante.
              </div>
            ) : (
              <ul className="divide-y divide-[#E4E7E3]">
                {conversacionesDelRol.map((conv) => {
                  const contraparte = obtenerContraparte(
                    conv.comercianteId,
                    conv.ganaderoId
                  );
                  const prod = productos.find((p) => p.id === conv.productoId);
                  const ultimoMsg = conv.mensajes[conv.mensajes.length - 1];
                  const noLeidos =
                    rolActivo === 'ganadero'
                      ? conv.noLeidosGanadero
                      : conv.noLeidosComerciante;
                  const activa = conversacionActiva?.id === conv.id;

                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => {
                          seleccionarConversacion(conv.id);
                          setMostrandoHiloMovil(true);
                        }}
                        className={`w-full text-left px-4 py-3.5 min-h-[68px] flex items-center gap-3 transition-colors cursor-pointer ${
                          activa
                            ? 'bg-white md:border-r-2 md:border-[#6E9167]'
                            : 'hover:bg-white/70'
                        }`}
                      >
                        <AvatarUsuario
                          nombre={contraparte.nombre}
                          foto={contraparte.foto}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-semibold text-[#141714] truncate">
                              {contraparte.nombre}
                            </span>
                            {noLeidos > 0 && (
                              <span className="min-w-[20px] h-5 px-1.5 text-[10px] font-bold font-tabular rounded-full bg-[#FF8030] text-white inline-flex items-center justify-center shrink-0">
                                {noLeidos}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-[#6E9167] truncate">
                            {prod?.nombre ?? 'Producto'}
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-[#6C736C] truncate">
                              {ultimoMsg
                                ? ultimoMsg.texto
                                : 'Conversación recién iniciada'}
                            </p>
                            {ultimoMsg && (
                              <span className="text-[10px] text-[#6C736C] font-tabular shrink-0">
                                {ultimoMsg.fecha.split(' ')[1] ?? ultimoMsg.fecha}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#6C736C] md:hidden shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Hilo activo de mensajes */}
          <div
            className={`${
              mostrandoHiloMovil ? 'flex' : 'hidden md:flex'
            } md:col-span-8 flex-col min-h-0 bg-white`}
          >
            {conversacionActiva ? (
              <>
                <div className="px-4 sm:px-5 py-3 border-b border-[#E4E7E3] bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
                  {(() => {
                    const contraparte = obtenerContraparte(
                      conversacionActiva.comercianteId,
                      conversacionActiva.ganaderoId
                    );
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarUsuario
                          nombre={contraparte.nombre}
                          foto={contraparte.foto}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-[#141714] truncate">
                            {contraparte.nombre} ·{' '}
                            <span className="font-normal text-[#454B45]">
                              {contraparte.subtitulo}
                            </span>
                          </p>
                          {productoActivo && (
                            <p className="text-xs text-[#6C736C] truncate font-tabular">
                              {productoActivo.nombre} — $
                              {productoActivo.precioPorKg.toFixed(2)} MXN/kg ·{' '}
                              {productoActivo.estado === 'vendido'
                                ? 'Vendido'
                                : `${productoActivo.cantidadKg} kg disponibles`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#F7F8F6]/50">
                  {conversacionActiva.mensajes.length === 0 && (
                    <div className="text-center py-8 space-y-3">
                      <p className="text-xs text-[#6C736C]">
                        Inicia la conversación con el mensaje sugerido o escribe
                        uno propio:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          enviarMensaje(
                            conversacionActiva.id,
                            PRIMER_MENSAJE_SUGERIDO
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 min-h-[44px] text-xs font-medium rounded-xl border border-[#6E9167] bg-[#F1F5F0] text-[#141714] hover:bg-[#6E9167] hover:text-white transition-colors cursor-pointer"
                      >
                        <span>«{PRIMER_MENSAJE_SUGERIDO}»</span>
                      </button>
                    </div>
                  )}

                  {conversacionActiva.mensajes.map((msg) => {
                    if (msg.tipo === 'notificacion') {
                      return (
                        <div
                          key={msg.id}
                          className="my-2 px-3.5 py-2.5 rounded-xl bg-[#FFF9EB] border border-[#FFDD8C] text-xs text-[#141714] flex items-center gap-2 max-w-lg mx-auto"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#CC4E00] shrink-0" />
                          <span className="flex-1">{msg.texto}</span>
                          <span className="text-[10px] text-[#6C736C] font-tabular shrink-0">
                            {msg.fecha}
                          </span>
                        </div>
                      );
                    }

                    if (msg.tipo === 'oferta' && msg.ofertaId) {
                      const oferta = conversacionActiva.ofertas.find(
                        (o) => o.id === msg.ofertaId
                      );
                      if (oferta) {
                        return (
                          <OfferCard
                            key={msg.id}
                            oferta={oferta}
                            producto={productoActivo}
                            rolActivo={rolActivo}
                            onAceptar={() =>
                              responderOferta(
                                conversacionActiva.id,
                                oferta.id,
                                'aceptada'
                              )
                            }
                            onRechazar={() =>
                              responderOferta(
                                conversacionActiva.id,
                                oferta.id,
                                'rechazada'
                              )
                            }
                            onContraofertar={manejarContraoferta}
                          />
                        );
                      }
                    }

                    const esPropio = msg.emisorId === usuarioActivoId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-sm border ${
                            esPropio
                              ? 'bg-[#6E9167] text-white border-[#6E9167]'
                              : 'bg-white text-[#141714] border-[#E4E7E3]'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.texto}</p>
                          <span
                            className={`block text-[10px] mt-1 font-tabular ${
                              esPropio ? 'text-white/80' : 'text-[#6C736C]'
                            }`}
                          >
                            {msg.fecha}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={finChatRef} />
                </div>

                {conversacionActiva.mensajes.length > 0 &&
                  rolActivo === 'ganadero' &&
                  conversacionActiva.mensajes.every(
                    (m) => m.emisorId !== ganaderoActivoId
                  ) && (
                    <div className="px-4 py-2 border-t border-[#E4E7E3] bg-[#F7F8F6] flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#6C736C]">
                        Sugerencia:
                      </span>
                      <button
                        type="button"
                        onClick={() => setTexto(PRIMER_MENSAJE_SUGERIDO)}
                        className="text-xs font-medium text-[#6E9167] hover:underline py-1 cursor-pointer"
                      >
                        {PRIMER_MENSAJE_SUGERIDO}
                      </button>
                    </div>
                  )}

                <form
                  onSubmit={manejarEnviar}
                  className="p-3 sm:p-3.5 border-t border-[#E4E7E3] bg-white flex items-center gap-2 pb-safe shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder={
                      rolActivo === 'comerciante'
                        ? 'Mensaje o contraoferta...'
                        : 'Escribe al comerciante...'
                    }
                    className="reciclo-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!texto.trim()}
                    aria-label="Enviar mensaje"
                    className="reciclo-btn-primary inline-flex items-center justify-center gap-1.5 min-w-[48px] px-4 text-sm font-semibold rounded-xl disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-[#6C736C]">
                Selecciona una conversación o contacta a un comerciante desde el
                mapa.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
