import { useState } from 'react';

interface AvatarUsuarioProps {
  nombre: string;
  foto?: string;
  size?: 'sm' | 'md' | 'lg';
}

function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 0) return 'RC';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function AvatarUsuario({
  nombre,
  foto,
  size = 'md',
}: AvatarUsuarioProps) {
  const [imgError, setImgError] = useState(false);

  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-14 h-14 text-base'
        : 'w-10 h-10 text-sm';

  if (foto && !imgError) {
    return (
      <img
        src={foto}
        alt={nombre}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${dims} rounded-full object-cover border border-[#E4E7E3] shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dims} rounded-full bg-[#F1F5F0] text-[#6E9167] border border-[#E4E7E3] flex items-center justify-center font-display font-semibold shrink-0 select-none`}
      aria-label={nombre}
    >
      {obtenerIniciales(nombre)}
    </div>
  );
}
