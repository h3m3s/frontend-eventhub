import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./info-pages.component.scss'],
  standalone: false
})
export class AboutPageComponent {
  currentYear = new Date().getFullYear();
}
