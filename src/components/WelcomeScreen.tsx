import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Repeat,
  Store,
  Tractor,
} from 'lucide-react';
import { LogoReCiclo } from './LogoReCiclo';
import { useReCiclo } from '../context/ReCicloContext';
import { ImageWithFallback } from './ImageWithFallback';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { setRolActivo, productos, comerciantes, ganaderos } = useReCiclo();

  const disponiblesCount = productos.filter(
    (p) => p.estado === 'disponible' && p.cantidadKg > 0
  ).length;
  const totalKgDisponibles = productos
    .filter((p) => p.estado === 'disponible')
    .reduce((acc, p) => acc + p.cantidadKg, 0);

  const entrarComo = (rol: 'ganadero' | 'comerciante') => {
    setRolActivo(rol);
    navigate(rol === 'ganadero' ? '/ganadero' : '/comerciante');
  };

  return (
    <div className="bg-white">
      {/* Hero móvil y escritorio */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-10 lg:pt-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-stretch">
          {/* Imagen primero en móvil para impacto visual inmediato */}
          <div className="lg:col-span-6 lg:order-2 flex">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#E4E7E3] bg-[#F7F8F6] aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
              <ImageWithFallback
                src="/src/assets/images/reciclo_hero_market_1795118111219.jpg"
                alt="Puesto de frutas y verduras en Central de Abastos con excedentes listos para aprovechar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 lg:hidden">
                <span className="text-xs font-medium text-white/90 block">
                  «Lo que sobra, a alguien le sirve»
                </span>
                <span className="font-display text-lg font-bold text-white">
                  {totalKgDisponibles.toLocaleString('es-MX')} kg disponibles hoy
                </span>
              </div>
            </div>
          </div>

          {/* Bloque de identidad y botones táctiles en zona natural del pulgar */}
          <div className="lg:col-span-6 lg:order-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <LogoReCiclo size={40} />
                <div>
                  <span className="font-display text-2xl font-bold tracking-tight text-[#141714] block leading-none">
                    ReCiclo
                  </span>
                  <span className="text-xs sm:text-sm text-[#6E9167] font-medium">
                    «Lo que sobra, a alguien le sirve»
                  </span>
                </div>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#141714] leading-[1.15] max-w-xl [text-wrap:balance]">
                Conecta excedentes de abasto con ganaderos cercanos
              </h1>

              <p className="mt-3 text-sm sm:text-base text-[#454B45] leading-relaxed max-w-xl">
                Aprovecha mermas limpias, frutas maduras y restos vegetales para
                alimentación animal. Negocia por compra directa o trueque desde
                tu teléfono sin registros ni contraseñas.
              </p>
            </div>

            {/* Tarjetas táctiles de acceso directo (>=48px) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => entrarComo('ganadero')}
                className="reciclo-card reciclo-card-interactive p-4 sm:p-5 text-left flex items-center sm:flex-col sm:items-start justify-between gap-4 cursor-pointer group min-h-[76px]"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-3.5 sm:gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F1F5F0] text-[#6E9167] flex items-center justify-center shrink-0">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-semibold text-[#141714]">
                      Entrar como Ganadero
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#454B45] leading-snug">
                      Ver mapa cercano, filtrar y enviar ofertas o trueques.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#6E9167] shrink-0">
                  <span className="hidden sm:inline">Explorar insumos</span>
                  <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => entrarComo('comerciante')}
                className="reciclo-card reciclo-card-interactive p-4 sm:p-5 text-left flex items-center sm:flex-col sm:items-start justify-between gap-4 cursor-pointer group min-h-[76px]"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-3.5 sm:gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF3EB] text-[#CC4E00] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-semibold text-[#141714]">
                      Entrar como Comerciante
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#454B45] leading-snug">
                      Publicar mermas del día y responder ofertas en chat.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#CC4E00] shrink-0">
                  <span className="hidden sm:inline">Ir a mi panel</span>
                  <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Métricas en cuadrícula 2x2 móvil -> 4 columnas escritorio */}
        <div className="mt-8 pt-6 border-t border-[#E4E7E3] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-3.5 sm:p-0 rounded-xl bg-[#F7F8F6] sm:bg-transparent border border-[#E4E7E3] sm:border-0">
            <p className="text-xs font-medium text-[#6C736C]">
              Lotes activos
            </p>
            <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#141714] font-tabular">
              {disponiblesCount}
            </p>
          </div>
          <div className="p-3.5 sm:p-0 rounded-xl bg-[#F7F8F6] sm:bg-transparent border border-[#E4E7E3] sm:border-0">
            <p className="text-xs font-medium text-[#6C736C]">
              Volumen disponible
            </p>
            <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#6E9167] font-tabular">
              {totalKgDisponibles.toLocaleString('es-MX')} kg
            </p>
          </div>
          <div className="p-3.5 sm:p-0 rounded-xl bg-[#F7F8F6] sm:bg-transparent border border-[#E4E7E3] sm:border-0">
            <p className="text-xs font-medium text-[#6C736C]">
              Comercios activos
            </p>
            <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#141714] font-tabular">
              {comerciantes.length} puntos
            </p>
          </div>
          <div className="p-3.5 sm:p-0 rounded-xl bg-[#F7F8F6] sm:bg-transparent border border-[#E4E7E3] sm:border-0">
            <p className="text-xs font-medium text-[#6C736C]">
              Ranchos ganaderos
            </p>
            <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#141714] font-tabular">
              {ganaderos.length} perfiles
            </p>
          </div>
        </div>
      </section>

      {/* Flujo circular en tarjetas compactas tipo lista en móvil */}
      <section className="border-t border-[#E4E7E3] bg-[#F7F8F6]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#141714] mb-5">
            Cómo funciona en 3 pasos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
            <div className="reciclo-card p-4 sm:p-6 flex md:flex-col items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F0] text-[#6E9167] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base font-semibold text-[#141714]">
                  01. Publicación de excedentes
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#454B45] leading-relaxed">
                  El comerciante registra merma de segunda, desperdicio limpio o
                  desecho orgánico con precio y kilogramos.
                </p>
              </div>
            </div>

            <div className="reciclo-card p-4 sm:p-6 flex md:flex-col items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9EB] text-[#CC4E00] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base font-semibold text-[#141714]">
                  02. Búsqueda por ubicación
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#454B45] leading-relaxed">
                  El ganadero ubica puntos cercanos en el mapa y filtra por
                  radio en kilómetros, precio o tipo de residuo.
                </p>
              </div>
            </div>

            <div className="reciclo-card p-4 sm:p-6 flex md:flex-col items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] text-[#FF8030] flex items-center justify-center shrink-0">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base font-semibold text-[#141714]">
                  03. Compra o trueque en chat
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#454B45] leading-relaxed">
                  Se envían ofertas económicas o trueques directos; al aceptar,
                  se actualiza el inventario automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
