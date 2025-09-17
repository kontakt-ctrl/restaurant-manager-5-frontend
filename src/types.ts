export interface MenuItem {
  id: number;
  category_id: number;
  name_pl: string;
  price_cents: number;
  image_url?: string;
  is_available: boolean;
  ingredients?: string | null;
  // Pozostałe pola dla wersji wielojęzycznej, jeśli istnieją...
  [key: string]: any;
}

export interface Payment {
  id: number;
  created_at: string;
  hostname: string;
  order_number: number;
  amount_cents: number;
  status: string;
  terminal_log?: string;
  description?: string;
}
