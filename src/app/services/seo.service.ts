import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {}

  setPageTitle(title: string): void {
    this.titleService.setTitle(`${title} | EventHub - Odkrywaj i Organizuj Wydarzenia`);
  }

  setPageDescription(description: string): void {
    this.metaService.updateTag({
      name: 'description',
      content: description
    });
  }

  setPageKeywords(keywords: string): void {
    this.metaService.updateTag({
      name: 'keywords',
      content: keywords
    });
  }

  setOgTags(title: string, description: string, image?: string, url?: string): void {
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (image) {
      this.metaService.updateTag({ property: 'og:image', content: image });
    }
    if (url) {
      this.metaService.updateTag({ property: 'og:url', content: url });
    }
  }

  setTwitterTags(title: string, description: string, image?: string): void {
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    if (image) {
      this.metaService.updateTag({ name: 'twitter:image', content: image });
    }
  }

  setStructuredData(data: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  setEventStructuredData(event: any): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      description: event.description,
      startDate: event.dateStart,
      endDate: event.dateEnd,
      image: `http://localhost:3000/${event.photoPath}`,
      location: {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: event.location,
          addressCountry: 'PL'
        }
      },
      organizer: {
        '@type': 'Organization',
        name: 'EventHub'
      },
      offers: {
        '@type': 'Offer',
        price: event.price.toString(),
        priceCurrency: 'PLN',
        availability: event.limit - event.reservations_count > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    };

    this.setStructuredData(structuredData);
  }

  setOrganizationSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EventHub',
      url: 'https://eventhub.pl',
      logo: 'https://eventhub.pl/assets/logo.png',
      description: 'Platforma do odkrywania i organizowania najlepszych eventów',
      sameAs: [
        'https://www.facebook.com/eventhub',
        'https://www.instagram.com/eventhub',
        'https://www.twitter.com/eventhub'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@eventhub.pl'
      }
    };

    this.setStructuredData(schema);
  }

  createDefaultHomeMeta(): void {
    this.setPageTitle('Strona Główna');
    this.setPageDescription('Odkryj najlepsze wydarzenia w Twojej okolicy - koncerty, festiwale, konferencje i wiele więcej na platformie EventHub.');
    this.setPageKeywords('eventy, koncerty, festiwale, konferencje, wydarzenia, rezerwacja');
    this.setOgTags(
      'EventHub - Odkrywaj i Organizuj Wydarzenia',
      'Platforma do odkrywania i organizowania najlepszych eventów',
      'https://eventhub.pl/assets/og-image.png'
    );
  }
}
