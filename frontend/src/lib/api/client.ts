import { UsersClient } from './users-client';
import { AuthClient } from './auth-client';
import { StoresClient } from './stores-client';
import { ProductsClient } from './products-client';
import { OrdersClient } from './orders-client';
import { CheckoutClient } from './checkout-client';
import { CartClient } from './cart-client';
import { StoreManagersClient } from './store-managers-client';
import { AdminClient } from './admin-client';

export class ApiClient {
  users: UsersClient;
  auth: AuthClient;
  stores: StoresClient;
  products: ProductsClient;
  orders: OrdersClient;
  checkout: CheckoutClient;
  cart: CartClient;
  storeManagers: StoreManagersClient;
  admin: AdminClient;

  constructor(baseURL?: string) {
    this.users = new UsersClient(baseURL);
    this.auth = new AuthClient(baseURL);
    this.stores = new StoresClient(baseURL);
    this.products = new ProductsClient(baseURL);
    this.orders = new OrdersClient(baseURL);
    this.checkout = new CheckoutClient(baseURL);
    this.cart = new CartClient(baseURL);
    this.storeManagers = new StoreManagersClient(baseURL);
    this.admin = new AdminClient(baseURL);
  }
}

export const api = new ApiClient();
