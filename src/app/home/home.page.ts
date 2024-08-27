import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, ToastController } from '@ionic/angular/standalone';
import { Camera, CameraDirection, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ],
})
export class HomePage {
  capturedImages: string[] = [];
  isCapturing: boolean = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  async captureImages() {
    this.capturedImages = [];
    this.isCapturing = true;

    const options: ImageOptions = {
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      saveToGallery: false,
      source: CameraSource.Camera,
      correctOrientation: true,
      direction: CameraDirection.Front
      // encodingType: this.camera.EncodingType.PNG, // Configurado para PNG
      // mediaType: this.camera.MediaType.PICTURE
    };

    for (let i = 0; i < 1; i++) {
      try {
        const photo: Photo = await Camera.getPhoto(options);
        if (photo.dataUrl) {
          this.capturedImages.push(photo.dataUrl);
        }
      } catch (err) {
        console.log("Erro na captura da imagem:", err);
        break;
      }
    }

    this.isCapturing = false;
  }

  uploadImages() {
    if (this.capturedImages.length === 1) {
      const uploadData = { images: this.capturedImages };

      this.http.post(`${environment.backend}/upload-images`, uploadData)
        .subscribe(async (response) => {
          const toast = await this.toastController.create({
            message: 'Digital processada com sucesso',
            duration: 2500,
            position: 'top',
          });

          await toast.present();

          this.capturedImages = [];
        }, async (error) => {
          const toast = await this.toastController.create({
            message: 'Erro ao processar. Tente novamente.',
            duration: 2500,
            position: 'top',
          });

          await toast.present();
        });
    }
  }
}
