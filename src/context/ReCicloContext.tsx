import React, { createContext, useContext, useMemo, useState } from 'react';
import comerciantesIniciales from '../data/comerciantes.json';
import ganaderosIniciales from '../data/ganaderos.json';
import productosIniciales from '../data/productos.json';
import conversacionesIniciales from '../data/conversaciones.json';
import {
  Comerciante,
  Conversacion,
  Ganadero,
  Mensaje,
  Oferta,
  Producto,
  RolUsuario,
  TipoEstablecimiento,
  TipoResiduo,
} from '../types';
import {
  obtenerFechaActual,
  obtenerFechaHoraActual,
} from '../services/chatService';
import { VentaRegistro } from '../services/offerService';

interface NuevoProductoInput {
  nombre: string;
  fotografia: string;
  precioPorKg: number;
  cantidadKg: number;
  tipoResiduo: TipoResiduo;
  descripcion: string;
  tipoEstablecimiento: TipoEstablecimiento;
  ubicacion: string;
  latitud: number;
  longitud: number;
}

interface NuevaOfertaEconomicaInput {
  productoId: string;
  precioPropuesto: number;
  cantidadSolicitadaKg: number;
  mensajeOpcional?: string;
}

interface NuevaOfertaTruequeInput {
  productoId: string;
  productoOfrecido: string;
  cantidadOfrecida: number;
  unidadMedida: string;
  descripcionTrueque?: string;
  cantidadSolicitadaKg: number;
}

interface ReCicloContextValue {
  rolActivo: RolUsuario;
  setRolActivo: (rol: RolUsuario) => void;
  comerciantes: Comerciante[];
  ganaderos: Ganadero[];
  productos: Producto[];
  conversaciones: Conversacion[];
  ventasHistorial: VentaRegistro[];
  comercianteActivoId: string;
  setComercianteActivoId: (id: string) => void;
  ganaderoActivoId: string;
  setGanaderoActivoId: (id: string) => void;
  comercianteActivo: Comerciante;
  ganaderoActivo: Ganadero;

  // Chat UI state
  chatAbierto: boolean;
  setChatAbierto: (abierto: boolean) => void;
  conversacionActivaId: string | null;
  abrirConversacionParaProducto: (
    productoId: string,
    comercianteId: string,
    ganaderoId?: string
  ) => string;
  seleccionarConversacion: (conversacionId: string) => void;
  enviarMensaje: (conversacionId: string, texto: string) => void;

  // Ofertas
  enviarOfertaEconomica: (input: NuevaOfertaEconomicaInput) => string;
  enviarOfertaTrueque: (input: NuevaOfertaTruequeInput) => string;
  responderOferta: (
    conversacionId: string,
    ofertaId: string,
    decision: 'aceptada' | 'rechazada'
  ) => void;

  // Productos
  publicarProducto: (input: NuevoProductoInput) => Producto;
  actualizarProducto: (productoId: string, cambios: Partial<Producto>) => void;
  eliminarProducto: (productoId: string) => void;
  marcarProductoVendido: (
    productoId: string,
    ganaderoNombre?: string,
    ganaderoId?: string
  ) => void;

  // Perfiles (edición de foto de demostración)
  actualizarFotoComerciante: (comercianteId: string, nuevaFoto: string) => void;
  actualizarFotoGanadero: (ganaderoId: string, nuevaFoto: string) => void;
}

const ReCicloContext = createContext<ReCicloContextValue | null>(null);

function construirVentasIniciales(productos: Producto[]): VentaRegistro[] {
  return productos
    .filter((p) => p.estado === 'vendido' && p.ventaInfo)
    .map((p) => ({
      id: `venta-init-${p.id}`,
      productoId: p.id,
      comercianteId: p.comercianteId,
      nombreProducto: p.nombre,
      fotografia: p.fotografia,
      cantidadVendidaKg: p.ventaInfo!.cantidadVendidaKg,
      precioFinalPorKg: p.ventaInfo!.precioFinalPorKg,
      totalPagado: p.ventaInfo!.totalPagado,
      tipoNegociacion: p.ventaInfo!.tipoNegociacion,
      detalleTrueque: p.ventaInfo!.detalleTrueque,
      fecha: p.ventaInfo!.fecha,
      ganaderoId: p.ventaInfo!.ganaderoId,
      ganaderoNombre: p.ventaInfo!.ganaderoNombre,
    }));
}

export function ReCicloProvider({ children }: { children: React.ReactNode }) {
  const [rolActivo, setRolActivo] = useState<RolUsuario>('ganadero');
  const [comerciantes, setComerciantes] = useState<Comerciante[]>(
    comerciantesIniciales as Comerciante[]
  );
  const [ganaderos, setGanaderos] = useState<Ganadero[]>(
    ganaderosIniciales as Ganadero[]
  );
  const [productos, setProductos] = useState<Producto[]>(
    productosIniciales as Producto[]
  );
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(
    conversacionesIniciales as Conversacion[]
  );
  const [ventasHistorial, setVentasHistorial] = useState<VentaRegistro[]>(() =>
    construirVentasIniciales(productosIniciales as Producto[])
  );

  const [comercianteActivoId, setComercianteActivoId] = useState<string>('com-1');
  const [ganaderoActivoId, setGanaderoActivoId] = useState<string>('gan-1');

  const [chatAbierto, setChatAbierto] = useState<boolean>(false);
  const [conversacionActivaId, setConversacionActivaId] = useState<string | null>(
    'conv-1'
  );

  const comercianteActivo = useMemo(
    () =>
      comerciantes.find((c) => c.id === comercianteActivoId) ?? comerciantes[0],
    [comerciantes, comercianteActivoId]
  );

  const ganaderoActivo = useMemo(
    () => ganaderos.find((g) => g.id === ganaderoActivoId) ?? ganaderos[0],
    [ganaderos, ganaderoActivoId]
  );

  const marcarLeida = (convId: string, rol: RolUsuario) => {
    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return rol === 'comerciante'
          ? { ...c, noLeidosComerciante: 0 }
          : { ...c, noLeidosGanadero: 0 };
      })
    );
  };

  const seleccionarConversacion = (conversacionId: string) => {
    setConversacionActivaId(conversacionId);
    marcarLeida(conversacionId, rolActivo);
  };

  const obtenerOCrearConversacion = (
    productoId: string,
    comercianteId: string,
    ganaderoId: string
  ): string => {
    const existente = conversaciones.find(
      (c) =>
        c.productoId === productoId &&
        c.comercianteId === comercianteId &&
        c.ganaderoId === ganaderoId
    );
    if (existente) {
      return existente.id;
    }

    const nuevaId = `conv-${Date.now()}`;
    const nuevaConv: Conversacion = {
      id: nuevaId,
      comercianteId,
      ganaderoId,
      productoId,
      mensajes: [],
      ofertas: [],
      noLeidosComerciante: 0,
      noLeidosGanadero: 0,
    };
    setConversaciones((prev) => [nuevaConv, ...prev]);
    return nuevaId;
  };

  const abrirConversacionParaProducto = (
    productoId: string,
    comercianteId: string,
    ganaderoIdParam?: string
  ): string => {
    const gId = ganaderoIdParam ?? ganaderoActivoId;
    const convId = obtenerOCrearConversacion(productoId, comercianteId, gId);
    setConversacionActivaId(convId);
    marcarLeida(convId, rolActivo);
    setChatAbierto(true);
    return convId;
  };

  const enviarMensaje = (conversacionId: string, texto: string) => {
    const textoLimpio = texto.trim();
    if (!textoLimpio) return;

    const emisorId =
      rolActivo === 'ganadero' ? ganaderoActivoId : comercianteActivoId;
    const nuevoMensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      emisorId,
      texto: textoLimpio,
      fecha: obtenerFechaHoraActual(),
      tipo: 'mensaje',
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id !== conversacionId) return c;
        return {
          ...c,
          mensajes: [...c.mensajes, nuevoMensaje],
          noLeidosComerciante:
            rolActivo === 'ganadero'
              ? c.noLeidosComerciante + 1
              : c.noLeidosComerciante,
          noLeidosGanadero:
            rolActivo === 'comerciante'
              ? c.noLeidosGanadero + 1
              : c.noLeidosGanadero,
        };
      })
    );
  };

  const enviarOfertaEconomica = (input: NuevaOfertaEconomicaInput): string => {
    const producto = productos.find((p) => p.id === input.productoId);
    if (!producto) return '';

    const convId = obtenerOCrearConversacion(
      producto.id,
      producto.comercianteId,
      ganaderoActivoId
    );
    const fecha = obtenerFechaHoraActual();
    const ofertaId = `of-${Date.now()}`;

    const nuevaOferta: Oferta = {
      id: ofertaId,
      tipo: 'economica',
      emisorId: ganaderoActivoId,
      precioOriginal: producto.precioPorKg,
      precioPropuesto: input.precioPropuesto,
      cantidadSolicitadaKg: input.cantidadSolicitadaKg,
      mensajeOpcional: input.mensajeOpcional?.trim() || undefined,
      estado: 'pendiente',
      fecha,
    };

    const mensajeOferta: Mensaje = {
      id: `msg-${Date.now()}`,
      emisorId: ganaderoActivoId,
      texto: `Oferta económica enviada por ${input.cantidadSolicitadaKg} kg ($${input.precioPropuesto.toFixed(2)} MXN/kg)`,
      fecha,
      tipo: 'oferta',
      ofertaId,
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          ofertas: [...c.ofertas, nuevaOferta],
          mensajes: [...c.mensajes, mensajeOferta],
          noLeidosComerciante: c.noLeidosComerciante + 1,
        };
      })
    );

    setConversacionActivaId(convId);
    return convId;
  };

  const enviarOfertaTrueque = (input: NuevaOfertaTruequeInput): string => {
    const producto = productos.find((p) => p.id === input.productoId);
    if (!producto) return '';

    const convId = obtenerOCrearConversacion(
      producto.id,
      producto.comercianteId,
      ganaderoActivoId
    );
    const fecha = obtenerFechaHoraActual();
    const ofertaId = `of-${Date.now()}`;

    const nuevaOferta: Oferta = {
      id: ofertaId,
      tipo: 'trueque',
      emisorId: ganaderoActivoId,
      productoOfrecido: input.productoOfrecido.trim(),
      cantidadOfrecida: input.cantidadOfrecida,
      unidadMedida: input.unidadMedida,
      descripcionTrueque: input.descripcionTrueque?.trim() || undefined,
      cantidadSolicitadaKg: input.cantidadSolicitadaKg,
      estado: 'pendiente',
      fecha,
    };

    const mensajeOferta: Mensaje = {
      id: `msg-${Date.now()}`,
      emisorId: ganaderoActivoId,
      texto: `Oferta de trueque enviada: ${input.cantidadOfrecida} ${input.unidadMedida} de ${input.productoOfrecido} por ${input.cantidadSolicitadaKg} kg`,
      fecha,
      tipo: 'oferta',
      ofertaId,
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          ofertas: [...c.ofertas, nuevaOferta],
          mensajes: [...c.mensajes, mensajeOferta],
          noLeidosComerciante: c.noLeidosComerciante + 1,
        };
      })
    );

    setConversacionActivaId(convId);
    return convId;
  };

  const responderOferta = (
    conversacionId: string,
    ofertaId: string,
    decision: 'aceptada' | 'rechazada'
  ) => {
    const conv = conversaciones.find((c) => c.id === conversacionId);
    if (!conv) return;
    const oferta = conv.ofertas.find((o) => o.id === ofertaId);
    if (!oferta || oferta.estado !== 'pendiente') return;

    const producto = productos.find((p) => p.id === conv.productoId);
    const ganadero = ganaderos.find((g) => g.id === conv.ganaderoId);
    const fechaHora = obtenerFechaHoraActual();
    const fechaDia = obtenerFechaActual();

    let textoNotificacion = '';

    if (decision === 'aceptada' && producto) {
      const kgNegociados = Math.min(
        oferta.cantidadSolicitadaKg,
        producto.cantidadKg
      );
      const restanteKg = Math.max(0, producto.cantidadKg - kgNegociados);

      setProductos((prev) =>
        prev.map((p) => {
          if (p.id !== producto.id) return p;
          return {
            ...p,
            cantidadKg: restanteKg,
            estado: restanteKg === 0 ? 'vendido' : 'disponible',
          };
        })
      );

      if (kgNegociados > 0) {
        const nuevaVenta: VentaRegistro = {
          id: `venta-${Date.now()}`,
          productoId: producto.id,
          comercianteId: producto.comercianteId,
          nombreProducto: producto.nombre,
          fotografia: producto.fotografia,
          cantidadVendidaKg: kgNegociados,
          precioFinalPorKg:
            oferta.tipo === 'economica' ? oferta.precioPropuesto : undefined,
          totalPagado:
            oferta.tipo === 'economica' && oferta.precioPropuesto
              ? Math.round(oferta.precioPropuesto * kgNegociados * 100) / 100
              : undefined,
          tipoNegociacion: oferta.tipo === 'economica' ? 'compra' : 'trueque',
          detalleTrueque:
            oferta.tipo === 'trueque'
              ? `${oferta.cantidadOfrecida ?? ''} ${oferta.unidadMedida ?? ''} de ${oferta.productoOfrecido ?? ''}`.trim()
              : undefined,
          fecha: fechaDia,
          ganaderoId: conv.ganaderoId,
          ganaderoNombre: ganadero?.nombre ?? 'Ganadero participante',
        };
        setVentasHistorial((prev) => [nuevaVenta, ...prev]);
      }

      if (oferta.tipo === 'economica') {
        textoNotificacion = `Oferta económica aceptada por ${kgNegociados} kg a $${(oferta.precioPropuesto ?? producto.precioPorKg).toFixed(2)} MXN/kg. ${restanteKg === 0 ? 'Publicación marcada como vendida.' : `Quedan ${restanteKg} kg disponibles.`}`;
      } else {
        textoNotificacion = `Oferta de trueque aceptada (${oferta.cantidadOfrecida} ${oferta.unidadMedida} de ${oferta.productoOfrecido} por ${kgNegociados} kg). ${restanteKg === 0 ? 'Publicación marcada como vendida.' : `Quedan ${restanteKg} kg disponibles.`}`;
      }
    } else {
      textoNotificacion =
        oferta.tipo === 'economica'
          ? 'El comerciante rechazó la oferta económica. Puedes responder en el chat para negociar condiciones.'
          : 'El comerciante rechazó la propuesta de trueque. Pueden continuar negociando en el chat.';
    }

    const notifMensaje: Mensaje = {
      id: `msg-notif-${Date.now()}`,
      emisorId: conv.comercianteId,
      texto: textoNotificacion,
      fecha: fechaHora,
      tipo: 'notificacion',
      ofertaId: oferta.id,
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id !== conversacionId) return c;
        return {
          ...c,
          ofertas: c.ofertas.map((o) =>
            o.id === ofertaId ? { ...o, estado: decision } : o
          ),
          mensajes: [...c.mensajes, notifMensaje],
          noLeidosGanadero: c.noLeidosGanadero + 1,
        };
      })
    );
  };

  const publicarProducto = (input: NuevoProductoInput): Producto => {
    const nuevo: Producto = {
      id: `prod-${Date.now()}`,
      comercianteId: comercianteActivoId,
      nombre: input.nombre.trim(),
      fotografia: input.fotografia,
      precioPorKg: input.precioPorKg,
      cantidadKg: input.cantidadKg,
      tipoResiduo: input.tipoResiduo,
      descripcion: input.descripcion.trim(),
      tipoEstablecimiento: input.tipoEstablecimiento,
      ubicacion: input.ubicacion.trim(),
      latitud: input.latitud,
      longitud: input.longitud,
      estado: 'disponible',
      fechaPublicacion: obtenerFechaActual(),
    };
    setProductos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const actualizarProducto = (
    productoId: string,
    cambios: Partial<Producto>
  ) => {
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoId) return p;
        const actualizado = { ...p, ...cambios };
        if (
          cambios.cantidadKg !== undefined &&
          cambios.cantidadKg <= 0 &&
          actualizado.estado === 'disponible'
        ) {
          actualizado.cantidadKg = 0;
          actualizado.estado = 'vendido';
        }
        return actualizado;
      })
    );
  };

  const eliminarProducto = (productoId: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
  };

  const marcarProductoVendido = (
    productoId: string,
    ganaderoNombre?: string,
    ganaderoId?: string
  ) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto || producto.estado === 'vendido') return;

    const fecha = obtenerFechaActual();
    const nuevaVenta: VentaRegistro = {
      id: `venta-${Date.now()}`,
      productoId: producto.id,
      comercianteId: producto.comercianteId,
      nombreProducto: producto.nombre,
      fotografia: producto.fotografia,
      cantidadVendidaKg: producto.cantidadKg,
      precioFinalPorKg: producto.precioPorKg,
      totalPagado:
        Math.round(producto.precioPorKg * producto.cantidadKg * 100) / 100,
      tipoNegociacion: 'compra',
      fecha,
      ganaderoId: ganaderoId ?? ganaderoActivoId,
      ganaderoNombre:
        ganaderoNombre?.trim() || 'Venta directa registrada en mostrador',
    };

    setVentasHistorial((prev) => [nuevaVenta, ...prev]);
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, estado: 'vendido', cantidadKg: 0 } : p
      )
    );
  };

  const actualizarFotoComerciante = (
    comercianteId: string,
    nuevaFoto: string
  ) => {
    setComerciantes((prev) =>
      prev.map((c) =>
        c.id === comercianteId ? { ...c, fotografiaPerfil: nuevaFoto } : c
      )
    );
  };

  const actualizarFotoGanadero = (ganaderoId: string, nuevaFoto: string) => {
    setGanaderos((prev) =>
      prev.map((g) =>
        g.id === ganaderoId ? { ...g, fotografiaPerfil: nuevaFoto } : g
      )
    );
  };

  return (
    <ReCicloContext.Provider
      value={{
        rolActivo,
        setRolActivo,
        comerciantes,
        ganaderos,
        productos,
        conversaciones,
        ventasHistorial,
        comercianteActivoId,
        setComercianteActivoId,
        ganaderoActivoId,
        setGanaderoActivoId,
        comercianteActivo,
        ganaderoActivo,
        chatAbierto,
        setChatAbierto,
        conversacionActivaId,
        abrirConversacionParaProducto,
        seleccionarConversacion,
        enviarMensaje,
        enviarOfertaEconomica,
        enviarOfertaTrueque,
        responderOferta,
        publicarProducto,
        actualizarProducto,
        eliminarProducto,
        marcarProductoVendido,
        actualizarFotoComerciante,
        actualizarFotoGanadero,
      }}
    >
      {children}
    </ReCicloContext.Provider>
  );
}

export function useReCiclo() {
  const ctx = useContext(ReCicloContext);
  if (!ctx) {
    throw new Error('useReCiclo debe utilizarse dentro de ReCicloProvider');
  }
  return ctx;
}
