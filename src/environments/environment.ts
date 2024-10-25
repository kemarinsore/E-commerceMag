// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'ganti dengan api',

  // Getter untuk URL register
  get registerUrl(): string {
    return `${this.baseUrl}/register`;
  },

  // Getter untuk URL login
  get loginUrl(): string {
    return `${this.baseUrl}/login`;
  },

  // Getter untuk URL profil
  get profilUrl(): string {
    return `${this.baseUrl}/user`;  // Adjust the endpoint according to the actual route
  },

  // Getter untuk URL produk
  get productsUrl(): string {
    return `${this.baseUrl}/product`;
  },

  getProductsByNameUrl(productName: string): string {
    return `${this.baseUrl}/products?name=${productName}`;
  },
  getProductPatchUrl(productId: string): string {
    return `${this.baseUrl}/product/${productId}`;
  }
};



