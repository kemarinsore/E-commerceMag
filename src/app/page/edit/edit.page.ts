import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  productForm: FormGroup;
  productId: string | null = null;
  previewImage: string | null = null;
  selectedFile: File | null = null;
  CameraSource = CameraSource;
  originalPrice: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private storage: Storage,
    private modalController: ModalController
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]], // Validasi angka
      description: [''],
      photo_urls: [''] // Konsisten menggunakan photo_urls
    });
  }

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');

    if (this.productId) {
      this.loadProductDetails(this.productId);
    } else {
      console.error('No product ID found. Redirecting to dashboard.');
      this.router.navigate(['/dashboard']);
    }
  }

  async loadProductDetails(id: string) {
    const url = environment.getProductPatchUrl(id);
    const token = await this.storage.get('my_token');

    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.productForm.patchValue({
            name: response.data.name,
            price: response.data.price,
            description: response.data.description,
            photo_urls: response.data.photo_urls || []
          });
          this.previewImage = response.data.photo_urls?.[0] || null;
          this.originalPrice = response.data.price; // Menyimpan harga asli tanpa format
        } else {
          console.error('Product not found. Redirecting to dashboard.');
          this.router.navigate(['/dashboard']);
        }
      },
      (error) => {
        console.error('Error loading product details:', error);
        if (error.status === 404) {
          alert('Product not found. Redirecting to dashboard.');
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }

  async submitForm() {
  console.log('Submitting form...', this.productForm.value);
  
  if (this.productForm.valid) {
    console.log('Form is valid, proceeding with submission...');

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('price', this.productForm.get('price')?.value); 
    formData.append('description', this.productForm.get('description')?.value);

    // Cek apakah ada file yang dipilih
    if (this.selectedFile) {
      console.log('Selected file:', this.selectedFile);

      // Sanitize the file name by replacing spaces with hyphens
      const sanitizedFileName = this.selectedFile.name.replace(/\s+/g, '-');

      // Create a new file object with the sanitized name if needed
      const file = new File([this.selectedFile], sanitizedFileName, { type: this.selectedFile.type });

      formData.append('photo_urls', file, sanitizedFileName);
    }

    const token = await this.storage.get('my_token');
    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = environment.getProductPatchUrl(this.productId!);
    this.http.patch(url, formData, { headers }).subscribe(
      (response: any) => {
        console.log('Product updated successfully:', response);
        console.log('Image path from server:', response.data.photo_urls);
        alert('Product has been updated successfully!');
        this.router.navigate(['/detail', this.productId]);
      },
      (error) => {
        console.error('Error updating product:', error);
        alert(`An error occurred while updating the product: ${error.message}`);
      }
    );
  } else {
    console.log('Form is not valid:', this.productForm.errors);
    alert('Please ensure all required fields are filled in correctly.');
  }
}


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a PNG or JPG image.');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
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
        this.selectedFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        this.productForm.patchValue({
          photo_urls: [this.previewImage]
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  }
}
