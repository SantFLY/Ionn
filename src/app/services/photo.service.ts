import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Photo } from '../models/photo.model';

const FOTOS_KEY = 'galeria_fotos';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private fotos: Photo[] = [];
  private cargado = false;

  constructor() {
    this.cargarFotos();
  }

  /**
   * Carga las fotos desde el almacenamiento local
   */
  async cargarFotos(): Promise<void> {
    if (this.cargado) return;
    try {
      const { value } = await Preferences.get({ key: FOTOS_KEY });
      if (value) {
        this.fotos = JSON.parse(value);
      } else {
        this.fotos = [];
      }
      this.cargado = true;
    } catch (error) {
      console.error('Error al cargar fotos:', error);
      this.fotos = [];
      this.cargado = true;
    }
  }

  /**
   * Obtiene todas las fotos
   */
  getFotos(): Photo[] {
    return [...this.fotos];
  }

  /**
   * Toma una foto usando la cámara del dispositivo o emulador.
   * En web usa getUserMedia para mostrar la cámara real (no explorador de archivos).
   */
  async tomarFoto(): Promise<Photo | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        // En Android/iOS: usa el plugin nativo de Capacitor
        const imagen = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });
        if (!imagen?.webPath) return null;
        return await this.guardarFoto(imagen.webPath);
      } else {
        // En navegador: la HomePage abre el modal de cámara y llama guardarFoto con el resultado
        return null;
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      return null;
    }
  }

  /**
   * Selecciona una foto desde la galería del dispositivo
   */
  async seleccionarDeGaleria(): Promise<Photo | null> {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (!imagen || !imagen.webPath) {
        return null;
      }

      return await this.guardarFoto(imagen.webPath);
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      return null;
    }
  }

  /**
   * Guarda la foto en almacenamiento local (y Filesystem en nativo).
   * Acepta URL (blob/data) o data URL (data:image/jpeg;base64,...).
   */
  async guardarFoto(webPath: string): Promise<Photo> {
    const nombreArchivo = `foto_${Date.now()}.jpeg`;
    let filepath: string;

    if (Capacitor.isNativePlatform()) {
      const base64Data = await this.leerComoBase64(webPath);
      const archivoGuardado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64Data,
        directory: Directory.Data,
      });
      filepath = archivoGuardado.uri;
    } else {
      filepath = webPath;
    }

    const nuevaFoto: Photo = {
      id: `foto_${Date.now()}`,
      filepath,
      webviewPath: webPath,
      fecha: new Date().toISOString(),
    };

    this.fotos.unshift(nuevaFoto);
    await this.persistirFotos();

    return nuevaFoto;
  }

  /**
   * Convierte la imagen a base64 para almacenamiento en Filesystem
   */
  private async leerComoBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64 || '');
      };
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Persiste las fotos en Preferences (almacenamiento local)
   */
  private async persistirFotos(): Promise<void> {
    await Preferences.set({
      key: FOTOS_KEY,
      value: JSON.stringify(this.fotos),
    });
  }

  /**
   * Elimina una foto por ID
   */
  async eliminarFoto(id: string): Promise<void> {
    this.fotos = this.fotos.filter((f) => f.id !== id);
    await this.persistirFotos();
  }

  /**
   * Obtiene la ruta de visualización de una foto
   */
  getFotoPath(foto: Photo): string {
    if (foto.webviewPath) {
      return foto.webviewPath;
    }
    return foto.filepath;
  }
}
