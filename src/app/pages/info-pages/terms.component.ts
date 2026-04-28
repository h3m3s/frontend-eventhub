import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-page',
  templateUrl: './terms.component.html',
  styleUrls: ['./info-pages.component.scss'],
  standalone: false
})
export class TermsPageComponent {
  currentYear = new Date().getFullYear();
}
