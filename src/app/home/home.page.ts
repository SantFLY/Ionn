import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Photo } from '../models/photo.model';
import { CameraModalComponent } from './camera-modal/camera-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  fotos: Photo[] = [];
  usuario: string | null = null;

  constructor(
    public photoService: PhotoService,
    private auth: AuthService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.photoService.cargarFotos();
    this.fotos = this.photoService.getFotos();
    const user = await this.auth.getUsuario();
    this.usuario = user?.nombre || user?.email || null;
  }

  async ionViewWillEnter() {
    await this.photoService.cargarFotos();
    this.fotos = this.photoService.getFotos();
  }

  async tomarFoto() {
    if (Capacitor.isNativePlatform()) {
      const foto = await this.photoService.tomarFoto();
      if (foto) this.fotos.unshift(foto);
      return;
    }
    // En navegador: abrir modal de cámara con interfaz Ionic
    const modal = await this.modalCtrl.create({
      component: CameraModalComponent,
      cssClass: 'modal-camara-fullscreen'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      await this.photoService.guardarFoto(data);
      this.fotos = this.photoService.getFotos();
    }
  }

  async seleccionarDeGaleria() {
    const foto = await this.photoService.seleccionarDeGaleria();
    if (foto) {
      this.fotos.unshift(foto);
    }
  }

  async eliminarFoto(id: string) {
    await this.photoService.eliminarFoto(id);
    this.fotos = this.photoService.getFotos();
  }

  getFotoPath(foto: Photo): string {
    return this.photoService.getFotoPath(foto);
  }

  formatearFecha(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
