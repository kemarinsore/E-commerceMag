import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  showPassword = false;
  loginForm!: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public router: Router,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public http: HttpClient,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(6),  
        Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}")  
      ]],
    });
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create({ message: 'Logging in...' });
    await loading.present();

    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      try {
        const formData = new FormData();
        formData.append('username', this.loginForm.get('username')?.value);
        formData.append('password', this.loginForm.get('password')?.value);

        const url = environment.loginUrl;
        this.http.post(url, formData).subscribe(
          async (response: any) => {
            console.log(response); 
            try {
              await loading.dismiss();
              
              if (response && response.data && response.data.token) { 
                await this.storage.set('my_token', response.data.token); 
                this.showToast('Login successful!');
                this.router.navigate(['/dashboard']);
              } else {
                this.showToast('No token found in response');
              }
        
            } catch (error) {
              await loading.dismiss();
              this.showToast('Error occurred during navigation. Please try again.');
              console.error('Error during navigation:', error);
            }
          },
          async (error: any) => {
            await loading.dismiss();
            this.handleError(error); 
          }
        );
      } catch (error) {
        await loading.dismiss();
        this.showToast('Error occurred during login. Please try again.');
        console.error('Error during login:', error);
      }
    } else {
      await loading.dismiss();
      this.showToast('Form is invalid. Please check your input.');
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

  handleError(error: any) {
    if (error.status === 401) {
      this.showToast('Invalid credentials. Please try again.'); 
    } else {
      this.showToast('An unexpected error occurred. Please try again.');
    }
    console.error('Error during login:', error);
  }
}
