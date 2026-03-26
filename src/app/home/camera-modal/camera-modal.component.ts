import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-camera-modal',
  templateUrl: './camera-modal.component.html',
  styleUrls: ['./camera-modal.component.scss'],
  standalone: false,
})
export class CameraModalComponent implements OnInit, OnDestroy {
  error = '';
  listo = false;
  private stream: MediaStream | null = null;
  private videoRef: HTMLVideoElement | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.iniciarCamara();
  }

  ngOnDestroy() {
    this.detenerCamara();
  }

  private iniciarCamara() {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        this.stream = stream;
        this.listo = true;
        setTimeout(() => this.asignarStreamAlVideo(), 300);
      })
      .catch((err) => {
        console.error(err);
        this.error = 'No se pudo acceder a la cámara. Revisa los permisos.';
      });
  }

  private asignarStreamAlVideo() {
    const video = document.getElementById('video-camara') as HTMLVideoElement;
    if (video && this.stream) {
      this.videoRef = video;
      video.srcObject = this.stream;
    }
  }

  private detenerCamara() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }

  capturar() {
    const video = document.getElementById('video-camara') as HTMLVideoElement;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.detenerCamara();
    this.modalCtrl.dismiss(dataUrl, 'ok');
  }

  cancelar() {
    this.detenerCamara();
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
