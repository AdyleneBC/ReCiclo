import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import { ProfileCard } from '../components/ProfileCard';
import { AvatarUsuario } from '../components/AvatarUsuario';

export function Perfiles() {
  const {
    comerciantes,
    ganaderos,
    productos,
    conversaciones,
    ventasHistorial,
    comercianteActivoId,
    setComercianteActivoId,
    comercianteActivo,
    ganaderoActivoId,
    setGanaderoActivoId,
    actualizarFotoComerciante,
    actualizarFotoGanadero,
    setChatAbierto,
    seleccionarConversacion,
    setRolActivo,
  } = useReCiclo();

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

  const totalOfertasRecibidas = useMemo(() => {
    return conversacionesComerciante.reduce(
      (acc, conv) => acc + conv.ofertas.length,
      0
    );
  }, [conversacionesComerciante]);

  const abrirPrimeraConversacionConOferta = () => {
    setRolActivo('comerciante');
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-8">
      <div className="pb-4 lg:pb-6 border-b border-[#E4E7E3]">
        <p className="text-xs font-medium text-[#6E9167]">
          Perfiles de demostración y confianza
        </p>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#141714] mt-0.5">
          Comerciantes y ganaderos
        </h1>
        <p className="text-xs sm:text-sm text-[#454B45] mt-1 max-w-2xl">
          Selecciona cualquier perfil ficticio de demostración para consultar su
          actividad, publicar productos, calcular distancias en el mapa o probar
          el chat.
        </p>
      </div>

      {/* Dashboard movido al perfil del comerciante activo */}
      <section className="reciclo-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7E3]">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarUsuario
              nombre={comercianteActivo.nombre}
              foto={comercianteActivo.fotografiaPerfil}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#CC4E00]">
                Dashboard del comerciante activo
              </p>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#141714] truncate">
                {comercianteActivo.nombre} ·{' '}
                {comercianteActivo.nombreEstablecimiento}
              </h2>
            </div>
          </div>

          <Link
            to="/comerciante"
            onClick={() => setRolActivo('comerciante')}
            className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Ir a administrar productos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6E9167]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F7F8F6] border border-[#E4E7E3]">
            <span className="text-xs font-medium text-[#6C736C] block">
              Publicaciones activas
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-[#141714] font-tabular block">
              {productosEnVenta.length}
            </span>
            <span className="text-[11px] text-[#6E9167]">
              Disponibles para ganaderos
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F7F8F6] border border-[#E4E7E3]">
            <span className="text-xs font-medium text-[#6C736C] block">
              Productos vendidos
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-[#141714] font-tabular block">
              {ventasComerciante.length}
            </span>
            <span className="text-[11px] text-[#454B45]">
              Compras y trueques cerrados
            </span>
          </div>

          <button
            type="button"
            onClick={abrirPrimeraConversacionConOferta}
            className="p-3.5 sm:p-4 rounded-xl bg-[#F7F8F6] border border-[#E4E7E3] hover:border-[#FF8030] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-[#6C736C]">
                Ofertas recibidas
              </span>
              {ofertasPendientes > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#FFF3EB] text-[#CC4E00] border border-[#FF8030]/40 font-tabular">
                  {ofertasPendientes} pendientes
                </span>
              )}
            </div>
            <span className="mt-1 font-display text-2xl font-bold text-[#141714] font-tabular block">
              {totalOfertasRecibidas}
            </span>
            <span className="text-[11px] font-medium text-[#CC4E00]">
              Revisar en mensajes
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRolActivo('comerciante');
              setChatAbierto(true);
            }}
            className="p-3.5 sm:p-4 rounded-xl bg-[#F7F8F6] border border-[#E4E7E3] hover:border-[#6E9167] text-left transition-colors cursor-pointer"
          >
            <span className="text-xs font-medium text-[#6C736C] block">
              Conversaciones activas
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-[#141714] font-tabular block">
              {conversacionesComerciante.length}
            </span>
            <span className="text-[11px] font-medium text-[#6E9167]">
              Abrir bandeja de chat
            </span>
          </button>
        </div>
      </section>

      {/* Sección informativa de verificación futura */}
      <section className="reciclo-card p-4 sm:p-6 bg-[#F7F8F6]">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F1F5F0] border border-[#E4E7E3] text-[#6E9167] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-sm sm:text-base font-bold text-[#141714]">
              Sistema de verificación de identidad contemplado en ReCiclo
            </h2>
            <p className="text-xs sm:text-sm text-[#454B45] leading-relaxed max-w-3xl">
              Para generar confianza entre comercios y productores ganaderos, en
              una futura implementación en producción se solicitará:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-[#141714] font-medium">
              <li className="bg-white border border-[#E4E7E3] rounded-xl px-3.5 py-2.5">
                1. Número telefónico verificado
              </li>
              <li className="bg-white border border-[#E4E7E3] rounded-xl px-3.5 py-2.5">
                2. Fotografía de perfil del titular
              </li>
              <li className="bg-white border border-[#E4E7E3] rounded-xl px-3.5 py-2.5">
                3. Fotografía de identificación oficial (INE)
              </li>
            </ul>
            <p className="text-[11px] sm:text-xs text-[#6C736C] pt-1">
              Nota de demostración: Todos los perfiles, teléfonos y ubicaciones
              son ficticios y no solicitan documentos ni contraseñas.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#141714]">
            Comerciantes ({comerciantes.length})
          </h2>
          <span className="text-xs text-[#6C736C]">
            Central de Abastos y comercios locales de la región
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {comerciantes.map((c) => (
            <ProfileCard
              key={c.id}
              tipo="comerciante"
              nombre={c.nombre}
              subtitulo={c.nombreEstablecimiento}
              detalleTipo={c.tipoEstablecimiento}
              telefono={c.telefono}
              ubicacion={c.ubicacion}
              descripcion={c.descripcion}
              foto={c.fotografiaPerfil}
              activo={c.id === comercianteActivoId}
              onSeleccionarActivo={() => setComercianteActivoId(c.id)}
              onCambiarFoto={(foto) => actualizarFotoComerciante(c.id, foto)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#141714]">
            Ganaderos ({ganaderos.length})
          </h2>
          <span className="text-xs text-[#6C736C]">
            Define tu ubicación de referencia en el mapa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ganaderos.map((g) => (
            <ProfileCard
              key={g.id}
              tipo="ganadero"
              nombre={g.nombre}
              subtitulo={g.rancho}
              telefono={g.telefono}
              ubicacion={g.ubicacion}
              descripcion={g.descripcion}
              foto={g.fotografiaPerfil}
              activo={g.id === ganaderoActivoId}
              onSeleccionarActivo={() => setGanaderoActivoId(g.id)}
              onCambiarFoto={(foto) => actualizarFotoGanadero(g.id, foto)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
