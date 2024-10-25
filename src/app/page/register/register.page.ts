import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword = false;
  regisForm!: FormGroup;
  previewImage: string | ArrayBuffer | null = null; 
  selectedFile: Blob | null = null;  
  CameraSource = CameraSource;

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public router: Router,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.regisForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}")
      ]],
      photoUrl: [null, Validators.required]
    });
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create({ message: 'Registering...' });
    await loading.present();
  
    this.regisForm.markAllAsTouched();
  
    if (this.regisForm.valid) {
      try {
        const formData = new FormData();
        formData.append('username', this.regisForm.get('username')?.value);
        formData.append('email', this.regisForm.get('email')?.value);
        formData.append('password', this.regisForm.get('password')?.value);
  
        if (this.selectedFile) {
          formData.append('photo_url', this.selectedFile, 'profile_image.jpg');
        }
  
        const url = environment.registerUrl;
        this.http.post(url, formData).subscribe(
          async (response: any) => {
            await loading.dismiss();
  
  
            // Save the email and photo URL to local storage
            localStorage.setItem('user_name', this.regisForm.get('username')?.value);
            localStorage.setItem('user_email', this.regisForm.get('email')?.value);
            localStorage.setItem('user_photo', response.data.photo_url || 'assets/img/avatar.png'); // Ensure photo URL is saved is saved properly
  
            this.showToast('Registration successful! Please log in.');
            this.router.navigate(['/login']);
          },
          async (error: any) => {
            await loading.dismiss();
            this.handleRegistrationError(error);
          }
        );
      } catch (error) {
        await loading.dismiss();
        this.showToast('Error occurred during registration. Please try again.');
      }
    } else {
      await loading.dismiss();
      this.showToast('Form is invalid. Please check your input.');
    }
  }
  

  handleRegistrationError(error: any) {
    if (error.status === 404) {
      this.showToast('The registration service is not available right now.');
    } else if (error.status === 422) {
      this.showToast('Validation failed. Please check your input.');
    } else {
      this.showToast('Error occurred during registration. Please try again.');
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
        this.selectedFile = blob; 

        this.regisForm.patchValue({ photoUrl: this.selectedFile }); 
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      this.showToast('Failed to take photo. Please try again.');
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result; 
        this.selectedFile = file;  
        this.regisForm.patchValue({ photoUrl: file });
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}
