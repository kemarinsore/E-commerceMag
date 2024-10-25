import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  product: any = {
    name: '',
    description: '',
    imageUrl: 'http://hopeanimalrescueofiowa.org/images/no_image_duplie_default.jpg', // default image
    price: 0,
    stock: 0
  };
  productId: string | null = null;
  isDeleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public navCtrl: NavController,
    private storage: Storage,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productId = productId;
      this.loadProductDetails(productId);
    }
  }

  ionViewWillEnter() {
    if (this.productId) {
      this.loadProductDetails(this.productId);
    }
  }

  async loadProductDetails(id: string) {
    const token = await this.storage.get('my_token'); // Ambil token dari storage
    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);  // Redirect ke login jika token tidak ada
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const url = `${environment.productsUrl}/${id}`;
    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        if (response.data) {
          // Isi form dengan data produk
          this.product = {
            name: response.data.name,
            description: response.data.description,
            photo_urls: response.data.photo_urls || [], 
            price: response.data.price,
            stock: response.data.stock || 0
          };
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
  

  async editProduct(productId: string | null) {
    if (!productId) {
      console.error('Product ID is missing, cannot navigate to edit page.');
      alert('Product ID is missing. Please try again.');
      return;
    }
  
    const token = await this.storage.get('my_token');
    if (!token) {
      console.error('No token found, redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }
  
    this.router.navigate(['/edit', productId]);
  }
  
  

  async deleteProduct() {
    if (this.isDeleting) return;
  
    const loading = await this.loadingController.create({
      message: 'Deleting product...',
    });
    await loading.present();
  
    if (confirm('Are you sure you want to delete this product?')) {
      this.isDeleting = true;
      const productId = this.route.snapshot.paramMap.get('id');
      const token = await this.storage.get('my_token');
  
      if (!token) {
        console.error('No token found, redirecting to login.');
        this.router.navigate(['/login']);
        await loading.dismiss();
        return;
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
  
      if (productId) {
        const url = `${environment.productsUrl}/${productId}`;
        this.http.delete(url, { headers }).subscribe(
          async () => {
            alert('Product has been successfully deleted');
            await loading.dismiss();
            this.router.navigate(['/dashboard']);
          },
          async (error) => {
            console.error('Error deleting product:', error);
            await loading.dismiss();
            if (error.status === 0) {
              alert('Network error or CORS issue. Please check your API server or CORS configuration.');
            } else if (error.status === 403) {
              alert('Access forbidden. Token might be missing or invalid.');
            } else if (error.status === 404) {
              alert('Product not found.');
            } else {
              alert('An error occurred while deleting the product');
            }
          },
          () => {
            this.isDeleting = false;
          }
        );
      }
    }
  }
  
  

  formatRupiah(value: number): string {
    return 'Rp ' + value.toLocaleString('id-ID', { minimumFractionDigits: 0 });
  }
}
