# Galería de Fotos - Ionic/Angular

Proyecto Ionic/Angular con galería de fotos utilizando la cámara del dispositivo o emulador, autenticación JWT y almacenamiento local.

## Requisitos previos

- Node.js 18+
- npm 9+
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio (para emulador Android) o Xcode (para iOS)
- Capacitor

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en navegador
npm start
```

## Pruebas

### Navegador

```bash
npm start
```

Abre http://localhost:4200 en el navegador.

**Nota:** En el navegador, la cámara usará la webcam del PC. Para probar en emulador, usa Android o iOS.

### Emulador Android

```bash
# Compilar
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

En Android Studio: Run > Run 'app' en un emulador o dispositivo físico.

### Emulador iOS (solo en macOS)

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

## Estructura del proyecto

- `src/app/services/photo.service.ts` - Servicio de fotos (cámara, almacenamiento)
- `src/app/services/auth.service.ts` - Servicio de autenticación JWT
- `src/app/guards/auth-guard.ts` - Protección de rutas
- `src/app/interceptors/auth-interceptor.ts` - Interceptor JWT para API REST
- `src/app/home/` - Página de galería
- `src/app/login/` - Página de login

## Plugins utilizados

- @capacitor/camera - Captura de fotos
- @capacitor/preferences - Almacenamiento local (key-value)
- @capacitor/filesystem - Almacenamiento de archivos en dispositivo nativo

## Modo demo

En `environment.ts`, `apiUrl` está vacío. El login funciona en modo demo: cualquier email y contraseña son válidos. Para conectar con API REST real, configura la URL en `environment.ts` y `environment.prod.ts`.
