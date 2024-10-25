import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  productForm: FormGroup;
  previewImage: string | ArrayBuffer | null = null;
  CameraSource = CameraSource;

  constructor(
    public formBuilder: FormBuilder,
    public router: Router,
    private http: HttpClient,
    private storage: Storage,
    private modalController: ModalController
  ) {
    this.productForm = this.formBuilder.group({
      id: [null], 
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      photo_urls: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.requestPermissions();
  }

  async requestPermissions() {
    const permissions = await Camera.requestPermissions({
      permissions: ['camera', 'photos']
    });

    if (permissions.camera === 'denied' || permissions.photos === 'denied') {
      alert('Aplikasi memerlukan akses ke kamera dan pustaka foto.');
    }
  }

  async selectImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri, 
        source: source,
      });

      if (image && image.webPath) {
        this.previewImage = image.webPath;

        const response = await fetch(image.webPath);
        const blob = await response.blob();

        this.productForm.patchValue({ photo_urls: [blob] });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Gagal mengambil foto. Silakan coba lagi.');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      const allowedTypes = ['image/png', 'image/jpeg'];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        alert('Tipe file tidak valid. Harap unggah gambar dalam format PNG atau JPG.');
        return;
      }

      this.productForm.patchValue({ photo_urls: files });

      if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result;
        };
        reader.readAsDataURL(files[0]);
      }
    }
  }

  formatRupiah(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^,\d]/g, '');
    const parts = value.split(',');
    const wholePart = parts[0];
    const decimalPart = parts[1] ? ',' + parts[1] : '';
    const rupiah = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.productForm.patchValue({ price: 'Rp ' + rupiah + decimalPart });
  }

  cleanPrice(price: string): string {
    return price.replace(/[^\d]/g, ''); 
  }

  async submitForm() {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('price', this.cleanPrice(this.productForm.get('price')?.value));
      formData.append('description', this.productForm.get('description')?.value);

      const files = this.productForm.get('photo_urls')?.value;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append('photo_urls', files[i], `photo_${i}.jpg`);
        }
      }

      const token = await this.storage.get('my_token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });

      this.http.post(`${environment.productsUrl}`, formData, { headers }).subscribe(
        (response: any) => {
          console.log('Product successfully created', response);
          this.router.navigate(['/dashboard']); 
        },
        (error) => {
          console.error('Error creating product:', error);
          if (error.status === 422) {
            alert('Validasi gagal. Harap periksa data yang dimasukkan.');
          } else if (error.status === 500) {
            alert('Terjadi kesalahan server.');
          } else {
            alert('Kesalahan tidak terduga. Silakan coba lagi.');
          }
        }
      );
    } else {
      console.log('Form is not valid', this.productForm);
    }
  }
}






  
  

