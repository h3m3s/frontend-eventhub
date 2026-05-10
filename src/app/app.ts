import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-eventhub');

  ngOnInit(): void {
    // Load dark mode preference on startup
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      const html = document.documentElement;
      html.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('dark-theme');
    }
  }
}
