# Documentación del Sistema de Carrito Unificado

## Resumen
Sistema implementado para centralizar todos los cambios realizados por el vendedor y sincronizarlos de manera unificada con Supabase.

## Archivos Modificados y Sus Funciones

### 1. `src/lib/indexedDB.js`
**Cambio principal:** Incremento de versión de DB de 1 a 2

**¿Por qué?** Para agregar el nuevo object store 'CarritoCambiosPrecios'

**Cómo funciona:**
- Al cambiar la versión, IndexedDB ejecuta la función `upgrade`
- Se agregaron validaciones `if (!database.objectStoreNames.contains(...))` para prevenir errores
- Esto permite agregar nuevas tablas sin romper las existentes

### 2. `src/lib/carritoContext.tsx` ⭐ ARCHIVO CLAVE
**Funcionalidad:** Contexto de React que maneja el estado global del carrito

**Tipos de datos que maneja:**
- `CambioPrecio`: Modificaciones de precios (registrarprecios)
- `Pedido`: Pedidos completos (tomarpedido)
- `CambioUbicacion`: Actualizaciones GPS (geocalizar)
- `ActualizacionDatos`: Cambios de info del cliente (actualizardatos)
- `ComprobantePago`: Archivos de comprobantes (solicitudpago)
- `RegistroDeuda`: Actualizaciones de deudas (deuda)

**Funciones principales:**
- `agregarItem()`: Guarda un item en IndexedDB y en memoria
- `eliminarItem()`: Borra un item (botón X)
- `sincronizarTodo()`: Envía todo a Supabase uno por uno
- `obtenerItemsPorCliente()`: Agrupa items por cliente
- `limpiarCarrito()`: Vacía todo (después de sincronizar)

**Flujo de sincronización:**
1. Itera cada item del carrito
2. Según el `tipo`, hace INSERT/UPDATE en la tabla correspondiente de Supabase
3. Si el item se guarda → lo marca como exitoso
4. Si falla → lo agrega a lista de fallidos
5. Resultados:
   - ✅ TODO exitoso → Limpia el carrito
   - ⚠️ Parcial → Elimina solo exitosos, muestra errores
   - ❌ Error conexión → No modifica nada

### 3. `src/app/layout.tsx`
**Cambio:** Envolver la app con `<CarritoProvider>`

```tsx
<CarritoProvider>
  {children}
</CarritoProvider>
```

**¿Por qué?** Para que todas las páginas tengan acceso al carrito mediante `useCarrito()`

### 4. `src/app/rutavisita/page.tsx`
**Cambios implementados:**
1. **Botón de carrito:** Botón azul debajo de flecha derecha
2. **Modal del carrito:** Muestra todos los items agrupados por cliente
3. **Botón X en cada item:** Permite eliminar items individuales
4. **Botón sincronizar:** Envía todo a Supabase

**Visualización:**
- Cada tipo de item tiene su emoji e información específica
- Se muestra el nombre del cliente y la fecha
- Los items se agrupan por cliente para mejor organización

### 5. `src/app/tomarpedido/page.tsx`
**Integración:**
```tsx
const { agregarItem } = useCarrito();

// Al guardar el pedido
await agregarItem({
  tipo: 'pedido',
  cliente_id: cliente.CODCL,
  cliente_nombre: cliente.nombre,
  items: carrito,
  total: totales.total,
  fecha: new Date().toISOString(),
  sincronizado: false
});
```

**Flujo:**
1. Usuario carga pedido y hace clic en "Guardar"
2. Se guarda en IndexedDB local (tabla Pedido)
3. Se agrega al carrito global
4. Aparece en el carrito de ruta de visita

### 6. `src/app/registrarprecios/page.tsx`
**Cambios:**
- **Eliminado:** Botones de sincronización local
- **Agregado:** Integración con carrito global
- Se filtra el carrito para mostrar solo cambios del cliente actual

**Integración:**
```tsx
const { agregarItem, carrito } = useCarrito();

// Al guardar cambio de precio
await agregarItem({
  tipo: 'precio',
  cliente_id: clienteSeleccionado,
  cliente_nombre: nombreCliente,
  articulo_id: codigo,
  articulo_nombre: articulo.Articulos?.nombre,
  precio_anterior: precioAnterior,
  precio_nuevo: nuevoPrecio,
  ...
});
```

### 7. `src/app/geocalizar/page.tsx`
**Integración:**
Cuando se guarda una nueva ubicación GPS, se agrega al carrito:

```tsx
await agregarItem({
  tipo: 'ubicacion',
  cliente_id: cliente.CODCL,
  cliente_nombre: cliente.nombre,
  latitud_anterior: locationData.latitude,
  longitud_anterior: locationData.longitude,
  latitud_nueva: locationActual.latitude,
  longitud_nueva: locationActual.longitude,
  fecha: new Date().toISOString(),
  sincronizado: false
});
```

### 8. `src/app/actualizardatos/page.tsx`
**Cambios:**
- Se guarda una copia de los datos originales
- Al hacer clic en "Guardar datos":
  1. Actualiza en IndexedDB
  2. Agrega al carrito con datos_anteriores y datos_nuevos

```tsx
await agregarItem({
  tipo: 'actualizacion_datos',
  cliente_id: cliente.CODCL,
  cliente_nombre: cliente.nombre,
  datos_anteriores: { telefono, email, notas, ... },
  datos_nuevos: { telefono, email, notas, ... },
  fecha: new Date().toISOString(),
  sincronizado: false
});
```

## Tablas de Supabase Necesarias

Para que la sincronización funcione, debes tener estas tablas en Supabase:

1. **pedidos**
   - cliente_id
   - items (jsonb)
   - total
   - fecha

2. **precios_clientes**
   - cliente_id
   - articulo_id
   - precio
   - tplis
   - CONSTRAINT UNIQUE (cliente_id, articulo_id)

3. **clientes**
   - id
   - latitud
   - longitud
   - telefono
   - email
   - notas
   - entrega_observaciones
   - orden_visita

4. **comprobantes_pago**
   - cliente_id
   - deuda_id
   - archivo_nombre
   - fecha

5. **deudas**
   - cliente_id
   - deuda_info (jsonb)
   - fecha

## Cómo Usar el Sistema

### Para el Usuario:
1. Realizar cambios en diferentes páginas (pedidos, precios, ubicación, etc.)
2. Ir a "Ruta de Visita"
3. Hacer clic en el botón azul "Carrito"
4. Revisar todos los cambios pendientes
5. (Opcional) Eliminar items con el botón X
6. Hacer clic en "Sincronizar Todo"
7. Esperar confirmación de sincronización

### Para el Desarrollador:
```tsx
// 1. Importar el hook
import { useCarrito } from '@/lib/carritoContext';

// 2. Obtener funciones
const { agregarItem, carrito, sincronizarTodo } = useCarrito();

// 3. Agregar item
await agregarItem({
  tipo: 'tu_tipo',
  cliente_id: id,
  cliente_nombre: nombre,
  // ... otros campos
  sincronizado: false
});

// 4. Ver items
console.log(carrito);

// 5. Sincronizar
await sincronizarTodo();
```

## Mensajes de Error Comunes

1. **"Error desconocido"**
   - Verificar consola del navegador (F12)
   - Probablemente la tabla no existe en Supabase

2. **"relation does not exist"**
   - La tabla mencionada no está creada en Supabase
   - Crear la tabla con las columnas correctas

3. **"new row violates row-level security policy"**
   - RLS (Row Level Security) está bloqueando
   - Desactivar RLS o configurar políticas correctas

4. **"null value in column violates not-null constraint"**
   - Falta un campo requerido
   - Verificar que el objeto tenga todos los campos

## Ventajas del Sistema

✅ **Sincronización unificada:** Todos los cambios en un solo lugar
✅ **Manejo de errores robusto:** Si algo falla, se mantiene en el carrito
✅ **Sincronización parcial:** Los exitosos se guardan, los fallidos quedan pendientes
✅ **Visibilidad:** El usuario ve todo lo que está por sincronizar
✅ **Flexibilidad:** Se pueden agregar nuevos tipos de datos fácilmente
✅ **Offline-first:** Los cambios se guardan localmente primero

## Próximos Pasos (Opcional)

- [ ] Agregar progress bar durante sincronización
- [ ] Implementar subida de archivos a Supabase Storage
- [ ] Agregar reintentos automáticos para items fallidos
- [ ] Sincronización en segundo plano
- [ ] Notificaciones push cuando se sincroniza
