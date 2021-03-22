import { BrowserModule } from '@angular/platform-browser';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { RequestResetComponent } from './components/request-reset/request-reset.component';
import { ResponseResetComponent } from './components/response-reset/response-reset.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { PagingComponent } from './components/paging/paging.component';
import { AuthService } from './service/auth.service';
import { ShoppingCartService } from './service/shoppingcart.service';
import { ProductService } from './service/product.service';
import { RouterModule } from '@angular/router';
import { CookieModule } from 'ngx-cookie';
import { HomepageComponent } from './components/homepage/homepage.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {FlexLayoutModule} from "@angular/flex-layout";
//import { HomepageComponent } from './components/homepage/homepage.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    RequestResetComponent,
    ResponseResetComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ProductListComponent,
    ProductDetailComponent,
    PagingComponent,
    ShoppingCartComponent,
    CheckoutComponent,
    HomepageComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    CookieModule.forRoot(),
    CarouselModule.forRoot(),
  ],
  exports: [
  HeaderComponent,
  FooterComponent,
],
schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthService, ShoppingCartService, ProductService, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
