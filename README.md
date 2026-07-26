# 🚗 Confia-CAR

Plataforma web moderna y completa de **Alquiler de Vehículos (Car Rental)** desarrollada para **Confia-CAR**.  
Una experiencia de usuario inmersiva, elegante y rápida, enfocada en la reserva de autos, pagos online seguros y comunicación en tiempo real.

> **Alquilá el vehículo ideal para tu próximo viaje con total confianza y transparencia.**

---

## 🌐 Ver Proyecto Online

[![Confia-CAR Frontend](https://img.shields.io/badge/Confia--CAR%20Frontend-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://confia-car-renta.vercel.app/)

---

## 📌 Características Principales

- ✅ **Diseño Premium & Modo Oscuro Moderno**  
  Interfaz de alta fidelidad visual con paleta de colores curada (Verde Esmeralda, Cyan, Teclas Neón, Glassmorphism y Dark Mode), garantizando una primera impresión impecable y responsive en cualquier dispositivo.

- ✅ **Catálogo de Flota & Filtros Interactivos**  
  Exploración completa de vehículos organizados por categoría (Sedán, SUV, Deportivo, Eléctrico, etc.), con especificaciones técnicas detalladas (combustible, transmisión, capacidad, año y precio por día).

- ✅ **Selector de Fechas & Calendario Inteligente**  
  Integración de calendario interactivo para selección de rango de fechas de retiro y devolución, con bloqueo automático de fechas previamente reservadas y cálculo de presupuesto en tiempo real.

- ✅ **Autenticación Dual (Google OAuth + Registro Local)**  
  Inicio de sesión rápido con Google OAuth 2.0 y flujo local con verificación de contraseña. Gestión de perfiles y avatares dinámicos (fotografía de Google o iniciales con gradientes únicos).

- ✅ **Integración de Pagos Online con Mercado Pago**  
  Pasarela de pagos en vivo integrada con la SDK de Mercado Pago. Generación automática de preferencia de checkout, procesamiento de pago seguro y cambio inmediato de estado de reserva.

- ✅ **Centro de Chat en Tiempo Real (Socket.io)**  
  Sistema de mensajería bidireccional instantánea conectado vía WebSockets entre el cliente y los administradores para resolver dudas por cada reserva individual.

- ✅ **Panel de Administración (Admin Dashboard)**  
  Panel de control exclusivo para administradores que incluye:
  - 📊 Métricas de ingresos, reservas activas e inventario.
  - 🚗 Gestión completa de la Flota (Alta, Baja, Modificación).
  - 📅 Gestión de Reservas y actualización de estados.
  - 💬 Centro de Chats activo para asistencia al cliente.
  - 👥 Gestión de Usuarios y roles del sistema.

- ✅ **Global Loader & Pantalla de Carga Inteligente**  
  Pantalla de bienvenida que verifica la disponibilidad del servidor en segundo plano con reintentos automáticos, asegurando una transición suave sin bloqueos de red o de cliente.

---

## 🛠️ Tecnologías Utilizadas

- **React.js (v18+)** _(Desarrollo basado en Componentes)_
- **Vite (v7)** _(Build Tool de ultra alto rendimiento)_
- **React Router DOM (v7)** _(Enrutamiento SPA, layouts anidados y guardias de seguridad)_
- **Socket.io Client** _(Comunicación WebSocket bidireccional en tiempo real)_
- **Google OAuth (@react-oauth/google)** _(Autenticación social de usuario)_
- **Mercado Pago SDK** _(Integración del checkout de pago seguro)_
- **Date-fns & React-Datepicker** _(Manejo avanzado de fechas y calendarios)_
- **SweetAlert2 & React Hot Toast** _(Alertas animadas, notificaciones toast y modales amigables)_
- **React Icons (Feather Icons / FontAwesome)** _(Iconografía limpia y estilizada)_

---

## 📂 Estructura del Proyecto Front

```text
Frontend/
├── public/                 # Recursos públicos (favicon, robots.txt, etc.)
│
├── src/
│   ├── assets/             # Recursos multimedia (Logos, imágenes de autos, videos)
│   │   ├── cars/
│   │   ├── home/
│   │   └── logo/
│   │
│   ├── components/
│   │   ├── Admin/          # (Dashboard, Gestión de Autos, Reservas, Chats y Usuarios)
│   │   ├── Auth/           # (Formularios de Login, Registro y Google Auth)
│   │   ├── Background/     # (Fondo visual animado)
│   │   ├── CarDetail/      # (Página de detalle técnico y reserva por vehículo)
│   │   ├── Cars/           # (Grilla de autos, tarjetas CarCard y filtros)
│   │   ├── Chat/           # (Widget flotante e interfaz de mensajería instantánea)
│   │   ├── Inicio/         # (Landing page, Hero, Características y CTA)
│   │   ├── MyBookings/     # (Panel de reservas del usuario y estado de pago)
│   │   ├── MyPayments/     # (Historial de comprobantes de pago)
│   │   ├── NavBar/         # (Barra de navegación dinámica y menú mobile)
│   │   ├── NotFound/       # (Página 404 personalizada)
│   │   ├── Profile/        # (Edición de perfil y seguridad del usuario)
│   │   └── ui/             # (GlobalLoader, UserAvatar, Badges, Loaders, Toaster)
│   │
│   ├── context/
│   │   ├── AuthContext.js      # (Estado global de usuario y token JWT)
│   │   ├── AuthProvider.jsx
│   │   ├── BookingContext.js   # (Estado global de reservas y carrito)
│   │   └── BookingProvider.jsx
│   │
│   ├── routes/
│   │   ├── AdminRoute.jsx      # (Definición de rutas de administración)
│   │   ├── AppRoutes.jsx       # (Definición de rutas públicas, protegidas y admin)
│   │   └── PrivateRoute.jsx    # (Definición de rutas privadas)
│   │
│   ├── services/
│   │   └── api.js          # (Instancia Axios con interceptores JWT y reintentos)
│   │
│   ├── utils/              # (Formateadores de fechas, alertas y helpers)
│   ├── App.jsx             # (Envoltorio principal de componentes)
│   ├── main.jsx            # (Punto de entrada React con Providers globales)
│   └── index.css           # (Variables CSS globales, utilidades y diseño)
│
├── vercel.json             # (Configuración de rewrites para ruteo SPA en Vercel)
├── package.json
└── vite.config.js
```

---

## 🚀 Instalación y Uso Local

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/LautaroLeall/Confia-CAR-Front.git
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno (.env)

Crea un archivo `.env` en la raíz de la carpeta `/Frontend`:

```env
# URL del backend (Local o Producción en Render)
VITE_BACKEND_URL=http://localhost:5000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=tu_google_client_id

# Mercado Pago Public Key
VITE_MP_PUBLIC_KEY=tu_public_key_de_mercadopago
```

### 4️⃣ Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---
