import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  cards: any[] = []; 
  previewImage: string = 'http://hopeanimalrescueofiowa.org/images/no_image_duplie_default.jpg'; 
  profileImage: string | null = null; 
  noProducts: boolean = false;
  product: any; 

  constructor(
    public navCtrl: NavController,
    private http: HttpClient,
    private storage: Storage,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfileImage();
  }

  ionViewWillEnter() {
    this.loadProducts(); 
  }

  async loadProfileImage() {
    const photoUrl = localStorage.getItem('user_photo') || 'assets/img/avatar.png';  // Default avatar
    this.profileImage = photoUrl;
  }

  refresh() {
    this.loadProducts();
  }

  async loadProducts() {
    const token = await this.storage.get('my_token');
    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${environment.productsUrl}`;
    
    this.http.get<any>(url, { headers, params: { cache: 'false' } }).subscribe(
      async (response) => {
        if (response.status === 200 && response.data.length > 0) {
          this.cards = response.data;
          await this.storage.set('products', response.data);
          this.showToast('Data produk berhasil diperbarui!');
          console.log('Products fetched and saved to storage');
        } else {
          this.noProducts = true;
          console.warn('No products available');
        }
      },
      (error) => {
        console.error('Error loading products:', error);
        this.noProducts = true;
      }
    );
  }

  async deleteCard(cardId: string, index: number) {
    const deleteUrl = `${environment.productsUrl}/${cardId}`;
    
    this.http.delete(deleteUrl).subscribe(
      async () => {
        console.log(`Product with ID ${cardId} deleted successfully.`);
        
        this.cards.splice(index, 1);
        await this.storage.set('products', this.cards); 
      },
      (error) => {
        console.error('Error deleting card:', error);
      }
    );
  }

  goToDetail(productId: string) {
    this.router.navigate(['/detail', productId]);
  }

  createCard() {
    this.navCtrl.navigateForward('/add'); 
  }

  goToProfil() {
    this.navCtrl.navigateForward('/profil'); 
  }

  async searchProductByName(productName: string) {
    const token = await this.storage.get('my_token');
    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const searchUrl = `${environment.productsUrl}`;
  console.log('Searching product by name:', searchUrl);
  
  this.http.get<any>(searchUrl, { headers }).subscribe(
    (response) => {
      console.log('Full response from API:', response);
      
      if (response.status === 200 && response.data.length > 0) {
        this.cards = response.data.filter((product: any) => 
          product.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (this.cards.length > 0) {
          this.noProducts = false;
          console.log('Products found:', this.cards);
        } else {
          this.cards = [];
          this.noProducts = true;
          this.showToast('Produk dengan nama tersebut tidak ditemukan.');
          console.warn('No products match the search term');
        }
      } else {
        this.cards = [];
        this.noProducts = true;
        this.showToast('Produk dengan nama tersebut tidak ditemukan.');
        console.warn('No products found');
      }
    },
    (error) => {
      console.error('Error searching product by name:', error);
      this.cards = [];
      this.noProducts = true;
      this.showToast('Terjadi kesalahan saat mencari produk.');
    }
  );
}

  
  onSearchProduct(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.searchProductByName(searchTerm.trim());  
    } else {
      this.loadProducts();  
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000, 
      position: 'bottom' 
    });
    toast.present();
  }

  formatRupiah(value: number): string {
    return 'Rp ' + value.toLocaleString('id-ID', { minimumFractionDigits: 0 });
  }
}
