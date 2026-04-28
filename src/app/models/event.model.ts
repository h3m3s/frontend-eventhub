export interface Event {
  id: number;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  adress: string;
  limit: number;
  price: string | number;
  category: string;
  photoPath: string;
  createdAt: string; 
  registered: number;
  available: number;
  occupancyPercent: number;
}

export interface EventResponse {
  id: number;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  adress: string;
  limit: number;
  price: string | number;
  category: string;
  photoPath: string;
  createdAt: string;
  registrations?: any[];
}

export interface EventsListResponse {
  data: Event[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
