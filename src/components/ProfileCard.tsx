import React from 'react';
import { Camera, Check, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { AvatarUsuario } from './AvatarUsuario';

interface ProfileCardProps {
  tipo: 'comerciante' | 'ganadero';
  nombre: string;
  subtitulo: string;
  detalleTipo?: string;
  telefono: string;
  ubicacion: string;
  descripcion: string;
  foto?: string;
  activo: boolean;
  onSeleccionarActivo: () => void;
  onCambiarFoto: (nuevaFoto: string) => void;
}

export function ProfileCard({
  tipo,
  nombre,
  subtitulo,
  detalleTipo,
  telefono,
  ubicacion,
  descripcion,
  foto,
  activo,
  onSeleccionarActivo,
  onCambiarFoto,
}: ProfileCardProps) {
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCambiarFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <article
      className={`reciclo-card p-4 sm:p-5 flex flex-col justify-between ${
        activo ? 'ring-2 ring-[#6E9167] border-[#6E9167]' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <AvatarUsuario nombre={nombre} foto={foto} size="lg" />
              <label
                title="Cambiar fotografía de perfil"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white border border-[#E4E7E3] flex items-center justify-center hover:border-[#6E9167] cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#454B45]" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarArchivo}
                  className="hidden"
                />
              </label>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#6C736C]">
                Perfil de demostración ·{' '}
                {tipo === 'comerciante' ? 'Comerciante' : 'Ganadero'}
              </p>
              <h3 className="font-display text-base font-bold text-[#141714] truncate">
                {nombre}
              </h3>
              <p className="text-xs font-medium text-[#6E9167] truncate">
                {subtitulo}
                {detalleTipo ? ` · ${detalleTipo}` : ''}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3.5 text-xs text-[#454B45] leading-relaxed">
          {descripcion}
        </p>

        <div className="mt-4 pt-3 border-t border-[#E4E7E3] space-y-1.5 text-xs text-[#454B45]">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#6C736C] shrink-0" />
            <span className="font-tabular">{telefono}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#6C736C] shrink-0 mt-0.5" />
            <span>{ubicacion}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6E9167]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Verificación documental contemplada (versión futura)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E4E7E3]">
        <button
          type="button"
          onClick={onSeleccionarActivo}
          className={`w-full inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activo
              ? 'bg-[#F1F5F0] text-[#6E9167] border border-[#6E9167]'
              : 'reciclo-btn-primary'
          }`}
        >
          {activo && <Check className="w-4 h-4" />}
          <span>
            {activo
              ? 'Perfil activo en sesión'
              : `Actuar como ${nombre.split(' ')[0]}`}
          </span>
        </button>
      </div>
    </article>
  );
}
