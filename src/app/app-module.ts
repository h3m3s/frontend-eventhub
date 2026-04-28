import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { EventSliderComponent } from './components/event-slider/event-slider.component';
import { LoginModalComponent } from './components/modals/login-modal.component';

import { HomeComponent } from './pages/home/home.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TermsPageComponent } from './pages/info-pages/terms.component';
import { PrivacyPageComponent } from './pages/info-pages/privacy.component';
import { AboutPageComponent } from './pages/info-pages/about.component';
import { ContactPageComponent } from './pages/info-pages/contact.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localePl);
@NgModule({
  declarations: [
    App,
    HeaderComponent,
    FooterComponent,
    EventCardComponent,
    EventSliderComponent,
    LoginModalComponent,
    HomeComponent,
    EventDetailComponent,
    ProfileComponent,
    TermsPageComponent,
    PrivacyPageComponent,
    AboutPageComponent,
    ContactPageComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    Title,
    Meta,
    { provide: LOCALE_ID, useValue: 'pl' },
    provideBrowserGlobalErrorListeners(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
