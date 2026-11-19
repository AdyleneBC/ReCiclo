# ReCiclo

**Eslogan:** «Lo que sobra, a alguien le sirve»

Aplicación web de economía circular que conecta a comerciantes de centrales de abastos y comercios locales con ganaderos interesados en adquirir productos sobrantes, mermas limpias y residuos orgánicos aprovechables para alimentación animal.

## Características implementadas

- **Pantalla de bienvenida** sin registro ni contraseñas, con acceso directo a la **Vista Ganadero** y **Vista Comerciante**.
- **Mapa interactivo (Leaflet + OpenStreetMap)** con marcadores de establecimientos, radio de distancia en kilómetros y tarjeta de detalle rápido.
- **Filtros de búsqueda** por tipo de residuo, tipo de establecimiento, radio de distancia (km), rango de precio y cantidad disponible.
- **Sistema de ofertas en chat compartido** (ofertas económicas con precio propuesto menor al original y ofertas de trueque), con aceptación o rechazo por parte del comerciante, notificaciones automáticas, deducción parcial de existencias e historial de productos vendidos o intercambiados.
- **Panel de administración del comerciante** para publicar, editar, ajustar precio/cantidad, cambiar fotografía, marcar como vendido y eliminar publicaciones.
- **Datos ficticios en JSON** (`comerciantes.json`, `ganaderos.json`, `productos.json`, `conversaciones.json`) sincronizados mediante React Context.

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Verificar compilación de producción
npm run build
```
