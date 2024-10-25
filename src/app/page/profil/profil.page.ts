import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment'; 

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {
  presentingElement: HTMLElement | null = null;
  userProfile: any = {
    username: '',
    email: '',
    photoUrl: '',
  };

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private storage: Storage,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.loadUserProfile();  
  }

  ionViewWillEnter() {
    this.loadUserProfile();  
  }

  async loadUserProfile() {
    const username = localStorage.getItem('user_name') || 'Guest';
    const email = localStorage.getItem('user_email') || 'No email available';
    const photoUrl = localStorage.getItem('user_photo') || 'assets/img/avatar.png';  // Default avatar if none provided
    
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Photo URL:', photoUrl);  

    this.userProfile = {
      username: username,
      email: email,
      photoUrl: photoUrl  
    };
  
    this.userProfile = {
      username: username,
      email: email,
      photoUrl: photoUrl  
    };

    this.cdr.detectChanges(); 

    this.showToast('Data berhasil diperbarui!');
}

async showToast(message: string) {
  const toast = await this.toastCtrl.create({
    message: message,
    duration: 2000, 
    position: 'bottom'
  });
  toast.present();
}

async logout() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
          handler: () => {
            // Clear local storage on logout
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_photo');
            localStorage.removeItem('my_token');  
              
            this.router.navigate(['/login']); 
          },
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/profil']);  
          },
        },
      ],
    });
  
    await actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    return role === 'confirm';
  };
}
