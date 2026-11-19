import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Compass,
  Eye,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import { Coordenadas } from '../types';
import { calcularDistanciaKm, formatearDistancia } from '../services/mapService';
import { ImageWithFallback } from './ImageWithFallback';

interface MensajeBot {
  id: string;
  rol: 'usuario' | 'asistente';
  texto: string;
  recomendacionesIds?: string[];
  esError?: boolean;
}

interface GanaderoChatbotProps {
  onVerDetalle: (productoId: string) => void;
}

const SUGERENCIAS_RAPIDAS = [
  'Quiero al menos 100 kg de alimento limpio',
  'Fruta madura cerca de mi ubicación',
  'Opciones a menos de $2.50 MXN/kg',
];

export function GanaderoChatbot({ onVerDetalle }: GanaderoChatbotProps) {
  const {
    ganaderoActivo,
    productos,
    comerciantes,
    abrirConversacionParaProducto,
  } = useReCiclo();

  const [abierto, setAbierto] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [coordsGPS, setCoordsGPS] = useState<Coordenadas | null>(null);
  const [estadoGPS, setEstadoGPS] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<MensajeBot[]>([
    {
      id: 'bot-bienvenida',
      rol: 'asistente',
      texto:
        'Hola, soy el buscador de alimento de ReCiclo. Dime cuántos kilogramos necesitas o qué tipo de residuo buscas y te mostraré las 3 opciones más cercanas a tu ubicación.',
    },
  ]);

  const finMensajesRef = useRef<HTMLDivElement | null>(null);

  const ubicacionReferencia = useMemo<Coordenadas>(
    () => coordsGPS ?? ganaderoActivo.coordenadas,
    [coordsGPS, ganaderoActivo.coordenadas]
  );

  const catalogoConDistancia = useMemo(() => {
    return productos
      .filter((p) => p.estado === 'disponible' && p.cantidadKg > 0)
      .map((p) => {
        const com = comerciantes.find((c) => c.id === p.comercianteId);
        return {
          ...p,
          distanciaKm: calcularDistanciaKm(ubicacionReferencia, {
            lat: p.latitud,
            lng: p.longitud,
          }),
          comercianteNombre: com?.nombre ?? 'Comerciante',
          nombreEstablecimiento:
            com?.nombreEstablecimiento ?? p.tipoEstablecimiento,
        };
      })
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [productos, comerciantes, ubicacionReferencia]);

  useEffect(() => {
    if (abierto && finMensajesRef.current) {
      finMensajesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [abierto, mensajes.length, cargando]);

  const activarUbicacionGPS = () => {
    if (coordsGPS) {
      setCoordsGPS(null);
      setEstadoGPS(null);
      return;
    }
    if (!navigator.geolocation) {
      setEstadoGPS('Tu navegador no permite geolocalización.');
      return;
    }
    setEstadoGPS('Obteniendo ubicación...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordsGPS({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setEstadoGPS('GPS activo');
      },
      () => {
        setEstadoGPS('Sin permiso GPS; usando ubicación de tu rancho.');
      },
      { timeout: 6000 }
    );
  };

  const enviarConsulta = async (textoConsulta: string) => {
    const textoLimpio = textoConsulta.trim();
    if (!textoLimpio || cargando) return;

    const msgUsuario: MensajeBot = {
      id: `u-${Date.now()}`,
      rol: 'usuario',
      texto: textoLimpio,
    };

    const historialParaApi = mensajes
      .filter((m) => !m.esError)
      .map((m) => ({ rol: m.rol, texto: m.texto }));

    setMensajes((prev) => [...prev, msgUsuario]);
    setEntrada('');
    setCargando(true);

    try {
      const resp = await fetch('/api/asistente-ganadero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: textoLimpio,
          historial: historialParaApi,
          ganaderoUbicacion: {
            nombre: ganaderoActivo.nombre,
            rancho: coordsGPS
              ? 'Tu ubicación GPS actual'
              : ganaderoActivo.rancho,
            ubicacion: coordsGPS
              ? 'Coordenadas del dispositivo'
              : ganaderoActivo.ubicacion,
            lat: ubicacionReferencia.lat,
            lng: ubicacionReferencia.lng,
          },
          productosDisponibles: catalogoConDistancia.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precioPorKg: p.precioPorKg,
            cantidadKg: p.cantidadKg,
            tipoResiduo: p.tipoResiduo,
            descripcion: p.descripcion,
            tipoEstablecimiento: p.tipoEstablecimiento,
            ubicacion: p.ubicacion,
            distanciaKm: p.distanciaKm,
            comercianteNombre: p.comercianteNombre,
            nombreEstablecimiento: p.nombreEstablecimiento,
          })),
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMensajes((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            rol: 'asistente',
            texto:
              data?.error ||
              'No fue posible obtener respuesta del asistente en este momento.',
            esError: true,
          },
        ]);
        return;
      }

      const botMsg: MensajeBot = {
        id: `a-${Date.now()}`,
        rol: 'asistente',
        texto: data.respuesta,
        recomendacionesIds: Array.isArray(data.recomendacionesIds)
          ? data.recomendacionesIds.slice(0, 3)
          : [],
      };
      setMensajes((prev) => [...prev, botMsg]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          rol: 'asistente',
          texto:
            'No hubo conexión con el servicio del asistente. Verifica que el servidor esté en ejecución.',
          esError: true,
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarConsulta(entrada);
  };

  return (
    <>
      {/* Globo flotante en esquina inferior derecha (solo visible para ganadero) */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir buscador inteligente de alimento"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 px-4 rounded-full bg-[#6E9167] text-white shadow-lg hover:bg-[#5C7B56] active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer border-2 border-white"
        >
          <Bot className="w-6 h-6 shrink-0" />
          <span className="font-display text-xs font-semibold whitespace-nowrap hidden sm:inline">
            Buscar alimento
          </span>
        </button>
      )}

      {/* Ventana flotante del chatbot */}
      {abierto && (
        <div
          className="fixed bottom-16 right-2 left-2 sm:left-auto sm:right-4 sm:w-[400px] md:bottom-6 md:right-6 z-[60] h-[72vh] max-h-[600px] bg-white border border-[#E4E7E3] rounded-2xl shadow-2xl flex flex-col overflow-hidden reciclo-sheet-enter"
          role="dialog"
          aria-modal="false"
          aria-label="Asistente de búsqueda de alimento"
        >
          {/* Cabecera */}
          <div className="px-4 py-3 bg-[#6E9167] text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold truncate">
                  Buscador de alimento
                </h2>
                <p className="text-[11px] text-white/90 truncate">
                  Exclusivo para ganaderos · Top 3 cercanos
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-white hover:bg-white/15 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de ubicación actual del ganadero */}
          <div className="px-3.5 py-2 bg-[#F7F8F6] border-b border-[#E4E7E3] flex items-center justify-between gap-2 text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 min-w-0 text-[#454B45]">
              <MapPin className="w-3.5 h-3.5 text-[#6E9167] shrink-0" />
              <span className="truncate">
                {coordsGPS
                  ? `GPS activo (${coordsGPS.lat}, ${coordsGPS.lng})`
                  : `${ganaderoActivo.rancho}`}
              </span>
            </div>
            <button
              type="button"
              onClick={activarUbicacionGPS}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                coordsGPS
                  ? 'bg-[#F1F5F0] border-[#6E9167] text-[#6E9167]'
                  : 'bg-white border-[#E4E7E3] text-[#454B45] hover:border-[#6E9167]'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>{coordsGPS ? 'Usar rancho' : 'Usar mi GPS'}</span>
            </button>
          </div>

          {estadoGPS && !coordsGPS && (
            <div className="px-3.5 py-1.5 bg-[#FFF9EB] border-b border-[#FFDD8C] text-[11px] text-[#CC4E00] shrink-0">
              {estadoGPS}
            </div>
          )}

          {/* Historial del chat */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F7F8F6]/60">
            {mensajes.map((msg) => {
              const esUsuario = msg.rol === 'usuario';
              const opciones = (msg.recomendacionesIds ?? [])
                .map((id) => catalogoConDistancia.find((p) => p.id === id))
                .filter(
                  (p): p is NonNullable<typeof p> => p !== undefined
                )
                .slice(0, 3);

              return (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed border ${
                        msg.esError
                          ? 'bg-[#FDF2F2] text-[#700808] border-[#700808]/30'
                          : esUsuario
                            ? 'bg-[#6E9167] text-white border-[#6E9167]'
                            : 'bg-white text-[#141714] border-[#E4E7E3]'
                      }`}
                    >
                      {msg.texto}
                    </div>
                  </div>

                  {/* Tarjetas de las 3 opciones recomendadas dentro del chat */}
                  {opciones.length > 0 && (
                    <div className="space-y-2 pl-1">
                      {opciones.map((prod, idx) => (
                        <div
                          key={prod.id}
                          className="bg-white border border-[#E4E7E3] rounded-xl p-2.5 space-y-2 shadow-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-16 h-14 rounded-lg overflow-hidden border border-[#E4E7E3] shrink-0 bg-[#F7F8F6]">
                              <ImageWithFallback
                                src={prod.fotografia}
                                alt={prod.nombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-[#6E9167] truncate">
                                Opción {idx + 1} · {prod.tipoResiduo}
                              </p>
                              <h4 className="font-display text-xs font-bold text-[#141714] line-clamp-2">
                                {prod.nombre}
                              </h4>
                              <p className="text-[11px] text-[#454B45] mt-0.5 font-tabular">
                                <span className="font-semibold text-[#141714]">
                                  ${prod.precioPorKg.toFixed(2)} MXN/kg
                                </span>{' '}
                                · {prod.cantidadKg} kg ·{' '}
                                <span className="text-[#6E9167] font-medium">
                                  {formatearDistancia(prod.distanciaKm)}
                                </span>
                              </p>
                              <p className="text-[10px] text-[#6C736C] truncate">
                                {prod.comercianteNombre} ·{' '}
                                {prod.nombreEstablecimiento}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAbierto(false);
                                abrirConversacionParaProducto(
                                  prod.id,
                                  prod.comercianteId
                                );
                              }}
                              className="reciclo-btn-primary min-h-[38px] px-2.5 text-[11px] font-semibold rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                              <span>Contactar vendedor</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAbierto(false);
                                onVerDetalle(prod.id);
                              }}
                              className="min-h-[38px] px-2.5 text-[11px] font-semibold rounded-lg border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6E9167] shrink-0" />
                              <span>Ver detalle</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E4E7E3] rounded-2xl px-3.5 py-2.5 text-xs text-[#454B45] inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#6E9167] animate-spin" />
                  <span>Buscando las 3 opciones más cercanas...</span>
                </div>
              </div>
            )}

            <div ref={finMensajesRef} />
          </div>

          {/* Sugerencias rápidas al iniciar */}
          {mensajes.length <= 2 && !cargando && (
            <div className="px-3 py-2 border-t border-[#E4E7E3] bg-white flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {SUGERENCIAS_RAPIDAS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => enviarConsulta(sug)}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-[#E4E7E3] bg-[#F7F8F6] text-[#141714] hover:border-[#6E9167] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Barra de envío */}
          <form
            onSubmit={manejarSubmit}
            className="p-2.5 border-t border-[#E4E7E3] bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              disabled={cargando}
              placeholder="Ej. 100 kg de alimento limpio..."
              className="reciclo-input flex-1 text-xs min-h-[42px] py-2"
            />
            <button
              type="submit"
              disabled={!entrada.trim() || cargando}
              aria-label="Enviar búsqueda"
              className="reciclo-btn-primary min-w-[44px] min-h-[42px] px-3 rounded-xl inline-flex items-center justify-center disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
