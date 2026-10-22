# Base Interna Privada & Dashboard de Administración OnlyCloud

Arquitectura y especificación técnica para la pasarela de autenticación privada de `ADMINCLOUD`, el panel visual de control "Base interna" con métricas de velocidad y uso, y la exploración categorizada de bases de datos con enmascaramiento y descifrado seguro de campos sensibles.

---

### Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> A partir de las aclaraciones del usuario, se confirman las siguientes directrices esenciales:
> - **Pasarela de Acceso:** Credenciales dedicadas (usuario y contraseña) para la cuenta administradora `ADMINCLOUD`.
> - **Métricas Principales:** Monitorización en tiempo real de velocidad de respuesta, consumo de almacenamiento, usuarios concurrentes y registro continuo de auditoría de seguridad y latencia.
> - **Tratamiento de Datos Sensibles:** Todos los campos confidenciales (contraseñas, tokens de sesión, coordenadas GPS exactas, mensajes privados) se presentan enmascarados por defecto, disponiendo de un botón de descifrado seguro en un solo clic con registro en la traza de auditoría.
> - **Aislamiento de Perfiles:** La pestaña y acceso a "Base interna" es estrictamente invisible e inaccesible para cuentas de usuario estándar; solo se materializa en la interfaz cuando la sesión activa pertenece a `ADMINCLOUD`.

---

## 1. Visión General y Concepto Central

- **Propósito:** Dotar a OnlyCloud de un entorno de administración centralizada ("Base interna") que represente fielmente la trastienda tecnológica de la red social. Ofrece visualización gráfica de rendimiento, estado de la base de datos Firestore, gestión de roles y permisos, y auditoría de seguridad de extremo a extremo.
- **Audiencia:** Cuenta de administración privada (`ADMINCLOUD` / `admin@onlycloud.net`). Los usuarios habituales no perciben ningún enlace, ruta ni vestigio visual de este panel.
- **Valor Clave:** Transparencia técnica total para el administrador sin comprometer los principios de privacidad, RGPD ni la seguridad criptográfica del sistema.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos de Usuario Principales

1. **Pasarela de Autenticación Privada:**
   - En el modal de inicio de sesión habitual o mediante acceso directo en el desplegable de perfil, existe la opción de autenticación administrativa.
   - El administrador ingresa su usuario (`admincloud` o `admin@onlycloud.net`) y contraseña maestra.
   - Al validarse, se elevan los privilegios de sesión (`isAdmin = true`), desbloqueando de forma instantánea el elemento de navegación **"Base interna"** en la barra superior y en el menú de usuario.

2. **Panel de Control y Métricas de Rendimiento:**
   - Vista panorámica con tarjetas de velocidad de consulta (ms), consumo de almacenamiento respecto a la cuota, usuarios activos en tiempo real y tasa de transacciones.
   - Gráfico de latencia y volumen de peticiones temporales con actualización dinámica.

3. **Explorador Categorizado de la Base de Datos:**
   - Navegación segmentada por pestañas de entidades:
     - **Usuarios & Credenciales:** ID, nombre, correo, fecha de registro, estado (Activo / Suspendido), rol y contraseña enmascarada (`••••••••••••`) con botón de revelar/descifrar.
     - **Publicaciones & Medios:** Metadatos de imágenes en la nube, etiquetas de visualización, métricas de interacciones.
     - **Geolocalización & Telemetría:** Registros de posición con coordenadas protegidas (Geohash público vs. lat/long precisa conmutables).
     - **Mensajería Cifrada (E2EE):** Cargas de texto cifradas en tránsito con opción de inspección mediante clave de auditoría.
     - **Auditoría de Seguridad:** Flujo cronológico de inicios de sesión, intentos fallidos, rotación de claves y accesos a datos protegidos.
     - **Consola de Consultas:** Ejecutor de filtros y búsquedas en tiempo real sobre las colecciones de Firestore.

### Identidad Visual y Estilo

- **Paleta y Acabado:** Fondo oscuro profundo (`#0B111E` / `#0F172A`) con superficies sobrias en gris pizarra (`#1E293B`), acentos ámbar y esmeralda para estados seguros (`#10B981` y `#F59E0B`), y tipografía tabular (`tabular-nums`) para todas las magnitudes numéricas.
- **Micro-interacciones:** Indicadores de estado de latencia, transiciones suaves entre categorías y confirmación visual al revelar campos descifrados.

---

## 3. Decisiones de Producto y Compromisos Técnicos

- **Enmascaramiento Dinámico con Registro de Auditoría:**
  - *Enfoque:* Los datos sensibles no se exponen en texto plano en la renderización inicial. Cada acción de "Descifrar / Revelar" genera un evento en el registro de auditoría interno.
  - *Razón:* Cumplimiento estricto de las directivas de seguridad y control de acceso responsable.
- **Pasarela de Credenciales con Doble Factor Simulado:**
  - *Enfoque:* Validación rigurosa de identificador y contraseña, con opción de confirmación de clave maestra o PIN de seguridad de sesión.
  - *Razón:* Garantiza que incluso si un dispositivo queda desbloqueado, el acceso a la base interna requiera validación consciente.
- **Integración con Firestore & Sincronización Local:**
  - *Enfoque:* Conexión directa a las colecciones de Firebase (`bright-flag-62ts5` / `ai-studio-onlycloudredsoci-0a639865-4734-4f39-821f-8251bf7d5b9e`) con capa defensiva y datos de demostración pre-cargados para inspección inmediata.
  - *Razón:* Disponibilidad instantánea de métricas y datos sin retrasos en entornos de prueba.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama de Componentes y Flujo de Autenticación

```
┌────────────────────────────────────────────────────────┐
│                   OnlyCloud Frontend                   │
└──────────────────────────────────┬─────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
     [Usuario Estándar]                        [Sesión ADMINCLOUD]
     (isAdmin = false)                         (isAdmin = true)
              │                                         │
     ┌────────┴────────┐                       ┌────────┴────────┐
     │  Vistas Comunes │                       │  "Base interna" │
     │  - Inicio       │                       └────────┬────────┘
     │  - Cielos       │                                │
     │  - Comunidad    │               ┌────────────────┴────────────────┐
     │  (Sin acceso)   │               │   AdminDatabaseDashboard        │
     └─────────────────┘               │   ┌───────────────────────────┐ │
                                       │   │ 1. Métricas & Velocidad   │ │
                                       │   │ 2. Usuarios & Passwords   │ │
                                       │   │ 3. Geolocalización Cifrada│ │
                                       │   │ 4. Mensajes E2EE          │ │
                                       │   │ 5. Auditoría de Seguridad │ │
                                       │   │ 6. Consola de Consultas   │ │
                                       │   └─────────────┬─────────────┘ │
                                       └─────────────────┼───────────────┘
                                                         │
                                        ┌────────────────┴────────────────┐
                                        │  Firestore DB & Reglas ABAC     │
                                        │  (ai-studio-onlycloudredsoci)   │
                                        └─────────────────────────────────┘
```

### Entidades y Colecciones Estructuradas

1. **`users`:** `id`, `username`, `email`, `role` ('admin' | 'user'), `passwordHash`, `isEncrypted`, `status` ('active' | 'suspended'), `createdAt`.
2. **`posts`:** `id`, `authorId`, `caption`, `imageUrl`, `category`, `likesCount`, `createdAt`.
3. **`telemetry_geo`:** `userId`, `geohash`, `latitude_masked`, `longitude_masked`, `latitude_raw`, `longitude_raw`, `lastPing`.
4. **`messages_e2ee`:** `id`, `senderId`, `receiverId`, `encryptedPayload`, `decryptedPreview`, `timestamp`.
5. **`security_audit_logs`:** `id`, `timestamp`, `eventType` ('AUTH_LOGIN', 'KEY_DECRYPT', 'PERMISSION_UPDATE'), `severity`, `details`.
