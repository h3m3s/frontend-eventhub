import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TermsPageComponent } from './pages/info-pages/terms.component';
import { PrivacyPageComponent } from './pages/info-pages/privacy.component';
import { AboutPageComponent } from './pages/info-pages/about.component';
import { ContactPageComponent } from './pages/info-pages/contact.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'terms', component: TermsPageComponent },
  { path: 'privacy', component: PrivacyPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
