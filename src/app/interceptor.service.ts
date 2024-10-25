import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

  constructor(private storage: Storage, private alertCtrl: AlertController) {
    this.initStorage(); // Initialize the storage
  }

  async initStorage() {
    await this.storage.create(); // Ensure storage is ready
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding the token for login requests
    if (req.url.includes('/login')) {
      return next.handle(req).pipe(
        catchError(error => this.handleError(error))
      );
    }

    // Retrieve the token from storage
    return from(this.storage.get('my_token')).pipe(
      mergeMap(token => {
        if (!token) {
          console.error('Token not found in storage');
          return throwError({ status: 403, message: 'Forbidden: No token available' });
        }

        // Clone the request and add the token to the Authorization header
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        // Proceed with the request
        return next.handle(clonedReq);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Error handling function
  private handleError(error: any): Observable<never> {
    const alert = this.alertCtrl.create({
      header: error.statusText || 'Error',
      message: error.message || 'An error occurred',
      buttons: ['OK']
    });
    alert.then(alertInstance => alertInstance.present());
    return throwError(error);
  }
}
