import { Check, Repeat, Tag, X } from 'lucide-react';
import { Oferta, Producto, RolUsuario } from '../types';

interface OfferCardProps {
  oferta: Oferta;
  producto?: Producto;
  rolActivo: RolUsuario;
  onAceptar: () => void;
  onRechazar: () => void;
  onContraofertar?: () => void;
}

export function OfferCard({
  oferta,
  producto,
  rolActivo,
  onAceptar,
  onRechazar,
  onContraofertar,
}: OfferCardProps) {
  const esEconomica = oferta.tipo === 'economica';
  const esPendiente = oferta.estado === 'pendiente';

  const estadoEstilo =
    oferta.estado === 'aceptada'
      ? 'bg-[#F1F5F0] text-[#6E9167] border-[#6E9167]/40'
      : oferta.estado === 'rechazada'
        ? 'bg-[#FDF2F2] text-[#700808] border-[#700808]/30'
        : 'bg-[#FFF9EB] text-[#CC4E00] border-[#FFDD8C]';

  const estadoTexto =
    oferta.estado === 'aceptada'
      ? 'Aceptada'
      : oferta.estado === 'rechazada'
        ? 'Rechazada'
        : 'Pendiente';

  return (
    <div className="my-2 rounded-2xl border border-[#E4E7E3] bg-white p-4 shadow-xs max-w-md mx-auto w-full">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E4E7E3]">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141714]">
          {esEconomica ? (
            <Tag className="w-3.5 h-3.5 text-[#6E9167]" />
          ) : (
            <Repeat className="w-3.5 h-3.5 text-[#CC4E00]" />
          )}
          <span>Oferta · {esEconomica ? 'Económica' : 'Trueque'}</span>
        </div>

        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${estadoEstilo}`}
        >
          {estadoTexto}
        </span>
      </div>

      {producto && (
        <p className="mt-2.5 text-xs font-medium text-[#454B45]">
          Producto:{' '}
          <span className="text-[#141714] font-semibold">
            {producto.nombre}
          </span>
        </p>
      )}

      {esEconomica ? (
        <div className="mt-2.5 grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F7F8F6] text-xs">
          <div>
            <span className="text-[#6C736C] block">Original</span>
            <span className="font-medium text-[#454B45] line-through font-tabular">
              ${(oferta.precioOriginal ?? producto?.precioPorKg ?? 0).toFixed(2)}
              /kg
            </span>
          </div>
          <div>
            <span className="text-[#6C736C] block">Propuesto</span>
            <span className="font-bold text-[#6E9167] font-tabular">
              ${(oferta.precioPropuesto ?? 0).toFixed(2)}/kg
            </span>
          </div>
          <div>
            <span className="text-[#6C736C] block">Cantidad</span>
            <span className="font-semibold text-[#141714] font-tabular">
              {oferta.cantidadSolicitadaKg} kg
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2.5 p-3 rounded-xl bg-[#F7F8F6] space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#6C736C]">Ofrece a cambio:</span>
            <span className="font-semibold text-[#141714] font-tabular text-right">
              {oferta.cantidadOfrecida} {oferta.unidadMedida} de{' '}
              {oferta.productoOfrecido}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#6C736C]">Solicita recibir:</span>
            <span className="font-semibold text-[#6E9167] font-tabular">
              {oferta.cantidadSolicitadaKg} kg del producto
            </span>
          </div>
          {oferta.descripcionTrueque && (
            <p className="text-[#454B45] pt-1 border-t border-[#E4E7E3]">
              {oferta.descripcionTrueque}
            </p>
          )}
        </div>
      )}

      {oferta.mensajeOpcional && (
        <p className="mt-2 text-xs text-[#454B45] italic">
          «{oferta.mensajeOpcional}»
        </p>
      )}

      <div className="mt-2 flex items-center justify-between text-[11px] text-[#6C736C]">
        <span>{oferta.fecha}</span>
      </div>

      {rolActivo === 'comerciante' && esPendiente && (
        <div className="mt-3 pt-3 border-t border-[#E4E7E3] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAceptar}
            className="reciclo-btn-primary flex-1 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aceptar</span>
          </button>
          <button
            type="button"
            onClick={onRechazar}
            className="reciclo-btn-danger flex-1 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Rechazar</span>
          </button>
          {onContraofertar && (
            <button
              type="button"
              onClick={onContraofertar}
              className="w-full min-h-[44px] px-3 text-xs font-medium text-[#454B45] border border-[#E4E7E3] rounded-xl hover:bg-[#F7F8F6] cursor-pointer"
            >
              Responder con contraoferta en el chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
