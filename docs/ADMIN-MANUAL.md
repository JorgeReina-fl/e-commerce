# 📖 Manual de Uso - Panel de Administración

**Tienda E-commerce - Guía para Administradores**

---

## 📋 Índice
1. [Acceso al Panel](#acceso-al-panel)
2. [Dashboard Principal](#dashboard-principal)
3. [Gestión de Productos](#gestión-de-productos)
4. [Gestión de Pedidos](#gestión-de-pedidos)
5. [Gestión de Cupones](#gestión-de-cupones)
6. [Inventario](#inventario)
7. [Analytics](#analytics)
8. [Usuarios](#usuarios)
9. [Reseñas](#reseñas)

---

## 🔑 Acceso al Panel

### Iniciar Sesión
1. Ve a `tu-tienda.com/login`
2. Ingresa tu email y contraseña de administrador
3. Click en "Iniciar sesión"
4. Serás redirigido automáticamente al panel admin

### ¿Olvidaste tu contraseña?
1. Click en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Recibirás un email con instrucciones
4. Click en el enlace del email (válido 1 hora)
5. Crea tu nueva contraseña

---

## 📊 Dashboard Principal

Al entrar al panel admin verás:

### Métricas Principales
- **Ventas Totales**: Ingresos del mes actual
- **Pedidos Totales**: Número de pedidos
- **Valor Medio**: Ticket promedio por pedido
- **Nuevos Clientes**: Clientes registrados este mes

### Gráficos
- **Tendencia de Ingresos**: Evolución de ventas (últimos 30 días)
- **Productos Más Vendidos**: Top 5 productos
- **Abandono de Carrito**: Tasa de carritos abandonados

---

## 📦 Gestión de Productos

### Añadir un Nuevo Producto

1. Click en "Productos" en el menú lateral
2. Click en "➕ Nuevo Producto" (botón azul superior derecha)
3. Rellenar formulario:

#### Información Básica
```
Nombre: Ej. "Camiseta Algodón Premium"
Descripción: Descripción detallada del producto
Categoría: Hombre / Mujer / Niños / Accesorios
Precio: 29.99 (sin símbolo €)
Descuento: 0-100 (porcentaje, opcional)
```

#### Imágenes
```
1. Click en "Subir Imagen" o arrastra archivo
2. Formatos: JPG, PNG, WebP
3. Tamaño recomendado: 1000x1000px
4. Puedes subir hasta 10 imágenes
5. La primera imagen es la principal
```

#### Colores
```
1. Click en "+ Añadir Color"
2. Nombre: Ej. "Azul Marino"
3. Código Hex: #1E40AF (usa el selector)
4. Subir imagen del producto en ese color (opcional)
```

#### Materiales
```
Ejemplo: Algodón, Poliéster, Mezcla
Puedes añadir varios separados por coma
```

#### Tallas y Stock

**Sistema Flexible de Tallas:**

**Opción 1: Tallas Únicas**
```
Talla 1: S
Talla 2: M
Talla 3: L
...
```

**Opción 2: Tallas Numéricas (35-47)**
```
Selecciona automáticamente: 35, 36, 37... 47
Para calzado
```

**Opción 3: Tallas por Letras (XXS-XXXL)**
```
Selecciona automáticamente: XXS, XS, S, M, L, XL, XXL, XXXL
Para ropa
```

**Configurar Stock:**
```
Para cada combinación Color + Material + Talla:
- Automáticamente se generan las combinaciones
- Ingresa el stock disponible para cada una
- Ej: Azul + Algodón + M = 15 unidades
```

#### Tags (Etiquetas)
```
Ejemplos: nuevo, bestseller, oferta, verano
Separados por coma
Usados para búsqueda y filtros
```

4. Click en "Crear Producto"

### Editar Producto Existente

1. En la lista de productos, click en ✏️ "Editar"
2. Modifica los campos necesarios
3. Click en "Actualizar Producto"

### Eliminar Producto

1. En la lista de productos, click en 🗑️ "Eliminar"
2. Confirma la eliminación
⚠️ **Cuidado**: Esta acción no se puede deshacer

---

## 🛒 Gestión de Pedidos

### Ver Todos los Pedidos

Lista muestra:
- ID del pedido
- Cliente (nombre y email)
- Fecha
- Total
- Estado actual

### Estados de Pedido

```
🟡 Pendiente   → Pedido creado, esperando pago
🟢 Pagado      → Pago confirmado
🔵 Enviado     → Pedido en camino
✅ Entregado   → Cliente lo recibió
❌ Cancelado   → Pedido cancelado
💰 Reembolsado → Dinero devuelto
```

### Cambiar Estado de Pedido

1. Click en el pedido
2. En "Estado Actual", selecciona nuevo estado
3. El cliente recibirá un email automático

### Ver Detalles del Pedido

Click en el ID del pedido para ver:
- Productos comprados
- Dirección de envío
- Historial de estados
- Información de pago
- Total desglosado

### Procesar Reembolso

1. Abre el pedido
2. Click en "💰 Reembolsar Pedido"
3. Confirma la acción
4. El dinero se devolverá automáticamente vía Stripe

⚠️ **Nota**: Solo puedes reembolsar pedidos con estado "Pagado" o "Enviado"

---

## 🎟️ Gestión de Cupones

### Crear un Cupón

1. Click en "Cupones" en el menú
2. Click en "➕ Nuevo Cupón"
3. Configurar:

```
Código: VERANO2024 (letras mayúsculas)
Tipo: 
  - Porcentaje (%) → 20% de descuento
  - Cantidad Fija (€) → 10€ de descuento

Valor: 20 (número)
Mínimo de Compra: 50 (opcional)
Máximo Descuento: 100 (solo para %)
Fecha Expiración: 31/12/2024
Máximo de Usos: 100 (número total de veces que se puede usar)
Descripción: "20% descuento en verano"
```

4. Click en "Crear Cupón"

### Tipos de Cupones

**Ejemplo 1: Descuento Porcentual**
```
Código: BIENVENIDO20
Tipo: Porcentaje
Valor: 20
Máximo Descuento: 50€
→ 20% de descuento, máximo 50€
```

**Ejemplo 2: Descuento Fijo**
```
Código: ENVIO5
Tipo: Cantidad Fija
Valor: 5
Mínimo: 30
→ 5€ de descuento si gastas mín. 30€
```

### Desactivar Cupón

1. En la lista de cupones, click en el switch "Activo/Inactivo"
2. El cupón deja de funcionar inmediatamente

---

## 📊 Inventario

### Dashboard de Inventario

Muestra:
- Stock total
- Productos con stock bajo (< 5 unidades)
- Movimientos recientes

### Alertas de Stock Bajo

El sistema te alertará automáticamente cuando:
- Un producto tiene menos de 5 unidades
- Un producto se agota completamente

### Ajustar Stock Manualmente

1. Ve a "Inventario"
2. Busca el producto
3. Click en "Editar Stock"
4. Ajusta las cantidades
5. Guarda cambios

**Nota**: Se registra automáticamente el movimiento

### Exportar Inventario

1. Click en "📥 Exportar"
2. Selecciona formato: Excel o CSV
3. Se descargará el archivo

---

## 📈 Analytics

### Secciones Disponibles

**1. Resumen del Negocio**
```
- Ingresos totales
- Número de pedidos
- Valor medio del pedido
- Nuevos clientes
```

**2. Tendencia de Ingresos**
```
Gráfico de línea mostrando:
- Ingresos diarios (últimos 30 días)
- Comparativa con mes anterior
```

**3. Productos Más Vendidos**
```
Top 5 productos por:
- Cantidad vendida
- Ingresos generados
```

**4. Abandono de Carrito**
```
- Total de carritos creados
- Carritos abandonados
- Tasa de abandono (%)
- Valor potencial perdido
```

**5. Segmentos de Clientes**
```
- Usuarios registrados
- Compradores
- Usuarios con wishlist
```

### Exportar Reportes

Click en "📥 Exportar Datos" para descargar CSV con todas las métricas.

---

## 👥 Usuarios

### Ver Lista de Usuarios

Muestra:
- Nombre
- Email
- Fecha de registro
- Rol (Usuario / Admin)
- Número de pedidos

### Hacer Usuario Admin

1. En la lista de usuarios, click en el usuario
2. Activa el switch "Es Administrador"
3. Guarda cambios

⚠️ **Cuidado**: Los admins tienen acceso completo al panel

### Eliminar Usuario

1. Click en 🗑️ al lado del usuario
2. Confirma la eliminación

⚠️ **Nota**: Esto NO elimina sus pedidos históricos

---

## ⭐ Reseñas

### Moderar Reseñas

El panel muestra todas las reseñas de clientes:
- Producto
- Usuario
- Calificación (1-5 estrellas)
- Comentario
- Fecha

### Eliminar Reseña Inapropiada

1. Localiza la reseña
2. Click en 🗑️ "Eliminar"
3. Confirma

**Cuándo eliminar:**
- Lenguaje ofensivo
- Spam
- Contenido inapropiado
- Reseñas falsas

---

## ❓ Preguntas Frecuentes

### ¿Cómo sé si hay un nuevo pedido?
Recibirás un email automático cada vez que haya un nuevo pedido.

### ¿Puedo cambiar el precio de un producto ya vendido?
Sí, pero no afecta pedidos anteriores. Solo afecta compras futuras.

### ¿Qué pasa si elimino un producto que alguien ya compró?
Los pedidos históricos mantienen la información del producto. No se pierde nada.

### ¿Cómo configuro envío gratis?
Edita el archivo `client/src/config/branding.js` → `shipping.freeShippingThreshold`

### ¿Puedo tener más de un administrador?
Sí, puedes hacer admin a cualquier usuario desde la sección de Usuarios.

### ¿Cómo restauro un producto eliminado?
No se puede. Las eliminaciones son permanentes. Considera desactivar en vez de eliminar.

---

## 🆘 Soporte

Si tienes problemas o preguntas:
- 📧 Email: soporte@tuagencia.com
- 📱 WhatsApp: +34 600 000 000
- 🕐 Horario: Lunes a Viernes 9:00 - 18:00

---

**Versión del Manual: 1.0**  
**Última actualización: Diciembre 2025**
