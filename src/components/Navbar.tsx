import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, MessageSquare } from 'lucide-react';
import { LogoReCiclo } from './LogoReCiclo';
import { useReCiclo } from '../context/ReCicloContext';
import { contarNoLeidos } from '../services/chatService';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    rolActivo,
    setRolActivo,
    conversaciones,
    comercianteActivoId,
    ganaderoActivoId,
    setChatAbierto,
  } = useReCiclo();

  const usuarioActivoId =
    rolActivo === 'ganadero' ? ganaderoActivoId : comercianteActivoId;
  const noLeidos = contarNoLeidos(conversaciones, rolActivo, usuarioActivoId);

  const esRuta = (ruta: string) => location.pathname === ruta;

  const tituloMovil = esRuta('/ganadero')
    ? 'Mapa de insumos'
    : esRuta('/comerciante')
      ? 'Mi comercio'
      : esRuta('/perfiles')
        ? 'Perfiles'
        : 'ReCiclo';

  const alternarRolMovil = () => {
    const siguiente = rolActivo === 'ganadero' ? 'comerciante' : 'ganadero';
    setRolActivo(siguiente);
    navigate(siguiente === 'ganadero' ? '/ganadero' : '/comerciante');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E7E3]">
      {/* Barra móvil compacta (48px) */}
      <div className="md:hidden px-3 h-12 flex items-center justify-between gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#141714] min-h-[44px] pr-1 whitespace-nowrap shrink-0 min-w-0"
        >
          <LogoReCiclo size={24} />
          <span className="font-display text-sm sm:text-base font-bold tracking-tight truncate">
            {tituloMovil}
          </span>
        </Link>

        <button
          type="button"
          onClick={alternarRolMovil}
          className="inline-flex items-center gap-1.5 px-2.5 min-h-[36px] text-[11px] sm:text-xs font-semibold rounded-xl border border-[#E4E7E3] bg-[#F7F8F6] text-[#141714] active:scale-[0.98] transition-transform whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#6E9167] shrink-0" />
          <span>
            {rolActivo === 'ganadero'
              ? 'Cambiar a modo comercial'
              : 'Cambiar a modo ganadero'}
          </span>
        </button>
      </div>

      {/* Barra escritorio (64px) contrato de 3 zonas */}
      <div className="hidden md:flex max-w-[1440px] mx-auto px-6 lg:px-8 h-16 items-center justify-between gap-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#141714] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#6E9167] rounded-md"
        >
          <LogoReCiclo size={30} />
          <span className="font-display text-xl font-bold tracking-tight">
            ReCiclo
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-6"
        >
          <Link
            to="/"
            className={`text-sm font-medium py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              esRuta('/')
                ? 'border-[#6E9167] text-[#141714]'
                : 'border-transparent text-[#454B45] hover:text-[#141714]'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/ganadero"
            onClick={() => setRolActivo('ganadero')}
            className={`text-sm font-medium py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              esRuta('/ganadero')
                ? 'border-[#6E9167] text-[#6E9167]'
                : 'border-transparent text-[#454B45] hover:text-[#141714]'
            }`}
          >
            Vista Ganadero
          </Link>
          <Link
            to="/comerciante"
            onClick={() => setRolActivo('comerciante')}
            className={`text-sm font-medium py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              esRuta('/comerciante')
                ? 'border-[#6E9167] text-[#6E9167]'
                : 'border-transparent text-[#454B45] hover:text-[#141714]'
            }`}
          >
            Vista Comerciante
          </Link>
          <Link
            to="/perfiles"
            className={`text-sm font-medium py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              esRuta('/perfiles')
                ? 'border-[#6E9167] text-[#141714]'
                : 'border-transparent text-[#454B45] hover:text-[#141714]'
            }`}
          >
            Perfiles
          </Link>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setChatAbierto(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[#E4E7E3] bg-white text-[#141714] hover:border-[#6E9167] hover:bg-[#F7F8F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#6E9167]" />
            <span>Mensajes</span>
            {noLeidos > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold font-tabular rounded-full bg-[#FF8030] text-white">
                {noLeidos}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
