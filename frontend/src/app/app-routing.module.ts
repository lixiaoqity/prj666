import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { RequestResetComponent } from './components/request-reset/request-reset.component';
import { ResponseResetComponent } from './components/response-reset/response-reset.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PaymentFinishComponent } from './components/payment-finish/payment-finish.component';
import { AuthGuard } from './helper/auth.guard';
import { AdminComponent } from './components/admin/admin/admin.component';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users.component';
import { ManageOrdersComponent } from './components/admin/manage-orders/manage-orders.component';
import { ManageProductsComponent } from './components/admin/manage-products/manage-products.component';


const profileModule = () => import('./components/profile/profile.module').then(p => p.ProfileModule);
const adminModule = () => import('./components/admin/admin.module').then(x => x.AdminModule);

const routes: Routes = [
  {
    path: 'homepage',
    component: HomepageComponent,
  },
  {
    path: 'sign-in',
    component: SigninComponent,
  },
  {
    path: 'sign-up',
    component: SignupComponent,
  },
  {
    path: 'request-reset-password',
    component: RequestResetComponent,
  },
  {
    path: 'response-reset-password/:token',
    component: ResponseResetComponent,
  },
  {
    path: 'product-list',
    component: ProductListComponent,
  },
  {
    path: 'product-list/:id',
    component: ProductDetailComponent,
  },
  {
    path: 'product-detail',
    component: ProductDetailComponent,
  },
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'payment-finish',
    component: PaymentFinishComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'response-reset-password/:token',
    component: ResponseResetComponent,
  },
  {
    path: 'profile',
    loadChildren: profileModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: adminModule,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'sign-in',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
