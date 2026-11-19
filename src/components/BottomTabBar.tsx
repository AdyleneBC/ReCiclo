import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, MessageSquare, Store, User } from 'lucide-react';
import { useReCiclo } from '../context/ReCicloContext';
import { contarNoLeidos } from '../services/chatService';

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    rolActivo,
    setRolActivo,
    conversaciones,
    comercianteActivoId,
    ganaderoActivoId,
    chatAbierto,
    setChatAbierto,
  } = useReCiclo();

  const usuarioActivoId =
    rolActivo === 'ganadero' ? ganaderoActivoId : comercianteActivoId;
  const noLeidos = contarNoLeidos(conversaciones, rolActivo, usuarioActivoId);

  const irA = (ruta: string, rol?: 'ganadero' | 'comerciante') => {
    setChatAbierto(false);
    if (rol) setRolActivo(rol);
    navigate(ruta);
  };

  const tabActivo = (ruta: string) => !chatAbierto && location.pathname === ruta;

  const esComerciante =
    rolActivo === 'comerciante' || location.pathname === '/comerciante';

  return (
    <nav
      aria-label="Navegación inferior móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E7E3] pb-safe"
    >
      <div className="grid grid-cols-4 items-center h-14">
        <button
          type="button"
          onClick={() => irA('/')}
          className={`flex flex-col items-center justify-center min-h-[44px] w-full cursor-pointer transition-colors ${
            tabActivo('/') ? 'text-[#6E9167]' : 'text-[#6C736C]'
          }`}
        >
          <Home
            className="w-5 h-5"
            strokeWidth={tabActivo('/') ? 2.4 : 1.9}
          />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Inicio
          </span>
        </button>

        {esComerciante ? (
          <button
            type="button"
            onClick={() => irA('/comerciante', 'comerciante')}
            className={`flex flex-col items-center justify-center min-h-[44px] w-full cursor-pointer transition-colors ${
              tabActivo('/comerciante') ? 'text-[#6E9167]' : 'text-[#6C736C]'
            }`}
          >
            <Store
              className="w-5 h-5"
              strokeWidth={tabActivo('/comerciante') ? 2.4 : 1.9}
            />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              Mi comercio
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => irA('/ganadero', 'ganadero')}
            className={`flex flex-col items-center justify-center min-h-[44px] w-full cursor-pointer transition-colors ${
              tabActivo('/ganadero') ? 'text-[#6E9167]' : 'text-[#6C736C]'
            }`}
          >
            <MapPin
              className="w-5 h-5"
              strokeWidth={tabActivo('/ganadero') ? 2.4 : 1.9}
            />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              Mapa
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setChatAbierto(true)}
          className={`relative flex flex-col items-center justify-center min-h-[44px] w-full cursor-pointer transition-colors ${
            chatAbierto ? 'text-[#6E9167]' : 'text-[#6C736C]'
          }`}
        >
          <div className="relative">
            <MessageSquare
              className="w-5 h-5"
              strokeWidth={chatAbierto ? 2.4 : 1.9}
            />
            {noLeidos > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 text-[10px] font-bold font-tabular rounded-full bg-[#FF8030] text-white flex items-center justify-center">
                {noLeidos}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Mensajes
          </span>
        </button>

        <button
          type="button"
          onClick={() => irA('/perfiles')}
          className={`flex flex-col items-center justify-center min-h-[44px] w-full cursor-pointer transition-colors ${
            tabActivo('/perfiles') ? 'text-[#6E9167]' : 'text-[#6C736C]'
          }`}
        >
          <User
            className="w-5 h-5"
            strokeWidth={tabActivo('/perfiles') ? 2.4 : 1.9}
          />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Perfiles
          </span>
        </button>
      </div>
    </nav>
  );
}
