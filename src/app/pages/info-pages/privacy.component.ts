import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-page',
  templateUrl: './privacy.component.html',
  styleUrls: ['./info-pages.component.scss'],
  standalone: false
})
export class PrivacyPageComponent {
  currentYear = new Date().getFullYear();
}
