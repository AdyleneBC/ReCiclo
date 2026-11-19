import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

interface ProductoCatalogoItem {
  id: string;
  nombre: string;
  precioPorKg: number;
  cantidadKg: number;
  tipoResiduo: string;
  descripcion: string;
  tipoEstablecimiento: string;
  ubicacion: string;
  distanciaKm: number;
  comercianteNombre: string;
  nombreEstablecimiento: string;
}

interface HistorialItem {
  rol: 'usuario' | 'asistente';
  texto: string;
}

function crearClienteGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function iniciarServidor() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/asistente-ganadero', async (req, res) => {
    try {
      const {
        mensaje,
        historial = [],
        ganaderoUbicacion,
        productosDisponibles = [],
      } = req.body as {
        mensaje?: string;
        historial?: HistorialItem[];
        ganaderoUbicacion?: {
          nombre?: string;
          rancho?: string;
          ubicacion?: string;
          lat?: number;
          lng?: number;
        };
        productosDisponibles?: ProductoCatalogoItem[];
      };

      if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
        return res.status(400).json({
          error: 'Escribe una consulta sobre el alimento que necesitas.',
        });
      }

      const ai = crearClienteGemini();
      if (!ai) {
        return res.status(503).json({
          error:
            'No se encontró la clave de Gemini en el servidor (Settings > Secrets).',
        });
      }

      const catalogoCompacto = productosDisponibles.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        tipoResiduo: p.tipoResiduo,
        cantidadKg: p.cantidadKg,
        precioPorKgMXN: p.precioPorKg,
        distanciaKm: p.distanciaKm,
        establecimiento: p.nombreEstablecimiento,
        vendedor: p.comercianteNombre,
        ubicacion: p.ubicacion,
        descripcion: p.descripcion,
      }));

      const contextoHistorial = (historial as HistorialItem[])
        .slice(-6)
        .map(
          (h) =>
            `${h.rol === 'usuario' ? 'Ganadero' : 'Asistente'}: ${h.texto}`
        )
        .join('\n');

      const ubicacionTexto = ganaderoUbicacion
        ? `${ganaderoUbicacion.rancho ?? 'Ubicación actual'} (${ganaderoUbicacion.ubicacion ?? ''}, lat ${ganaderoUbicacion.lat ?? ''}, lng ${ganaderoUbicacion.lng ?? ''})`
        : 'Ubicación regional de demostración';

      const systemInstruction = `Eres el Asistente de Búsqueda de Alimento de ReCiclo, exclusivo para ganaderos.

REGLAS ESTRICTAS DE ALCANCE:
1. SOLO puedes responder consultas relacionadas con buscar, filtrar o recomendar alimentos, excedentes agrícolas, mermas o residuos orgánicos del catálogo de ReCiclo para alimentación animal.
2. Si el usuario pregunta cualquier tema ajeno a la búsqueda de alimento en ReCiclo (por ejemplo: programación, recetas humanas, política, chistes, clima general, medicina veterinaria avanzada o tareas generales), debes marcar fueraDeTema=true, devolver recomendacionesIds=[] y responder amablemente en máximo 2 oraciones que solo estás autorizado para buscar alimento y excedentes disponibles para ganado en ReCiclo.
3. Cuando la consulta SÍ sea sobre búsqueda de alimento:
   - Analiza todos los criterios del ganadero: cantidad mínima o aproximada en kg (ej. "al menos 100 kg" => cantidadKg >= 100), tipo de residuo ("alimento limpio" o "limpio" corresponde principalmente a "Desperdicio limpio" o "Merma de segunda" limpia sin mezcla sucia), tipo de alimento (fruta, verdura, hoja, papa, zanahoria, cáscara), precio en MXN/kg y cercanía a su ubicación actual (menor distanciaKm).
   - Selecciona EXACTAMENTE las 3 mejores opciones del catálogo que más se acerquen a los criterios y estén más cerca de su ubicación actual (o menos de 3 si el catálogo tuviera menos de 3 productos disponibles).
   - Si no hay 3 opciones que cumplan el 100% de los filtros exactos, incluye en recomendacionesIds las opciones más cercanas o aproximadas e indícalo claramente en la respuesta.
   - Usa únicamente IDs reales existentes en el catálogo proporcionado. Nunca inventes productos ni precios.
   - En "respuesta", redacta en español claro y conciso (máximo 3-4 oraciones) explicando por qué esas 3 opciones son las mejores respecto a su ubicación actual (${ubicacionTexto}) y mencionando precios en MXN/kg.`;

      const prompt = `Ubicación actual del ganadero: ${ubicacionTexto}

Catálogo actual de productos disponibles (ordenado por distancia en km):
${JSON.stringify(catalogoCompacto)}

${contextoHistorial ? `Historial reciente:\n${contextoHistorial}\n` : ''}
Consulta del ganadero: "${mensaje.trim()}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fueraDeTema: {
                type: Type.BOOLEAN,
                description:
                  'true si el mensaje no trata sobre buscar alimento o insumos para ganado en ReCiclo.',
              },
              respuesta: {
                type: Type.STRING,
                description:
                  'Respuesta breve en español explicando las opciones encontradas o el límite de alcance.',
              },
              recomendacionesIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Lista ordenada de máximo 3 IDs de productos reales del catálogo que mejor coinciden.',
              },
            },
            required: ['fueraDeTema', 'respuesta', 'recomendacionesIds'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      let parsed: {
        fueraDeTema?: boolean;
        respuesta?: string;
        recomendacionesIds?: string[];
      };

      try {
        parsed = JSON.parse(rawText);
      } catch {
        return res.status(502).json({
          error:
            'No fue posible interpretar la respuesta del asistente. Intenta reformular tu búsqueda.',
        });
      }

      const idsValidos = new Set(productosDisponibles.map((p) => p.id));
      const recomendacionesIds = Array.isArray(parsed.recomendacionesIds)
        ? parsed.recomendacionesIds
            .filter((id): id is string => typeof id === 'string' && idsValidos.has(id))
            .slice(0, 3)
        : [];

      return res.json({
        fueraDeTema: Boolean(parsed.fueraDeTema),
        respuesta:
          parsed.respuesta ||
          'Aquí tienes las opciones más cercanas a tu búsqueda.',
        recomendacionesIds: parsed.fueraDeTema ? [] : recomendacionesIds,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al consultar el asistente.';
      if (
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('403')
      ) {
        return res.status(403).json({
          error:
            'La clave de Gemini API no es válida o no tiene permisos. Verifica Settings > Secrets.',
        });
      }
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error:
            'Se alcanzó temporalmente el límite gratuito de consultas. Intenta de nuevo en unos segundos.',
        });
      }
      if (
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand')
      ) {
        return res.status(503).json({
          error:
            'El modelo gratuito de Gemini está experimentando alta demanda temporal. Intenta de nuevo en unos segundos.',
        });
      }
      return res.status(500).json({
        error: `No se pudo completar la consulta al asistente: ${msg}`,
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReCiclo server listening on http://0.0.0.0:${PORT}`);
  });
}

iniciarServidor();
