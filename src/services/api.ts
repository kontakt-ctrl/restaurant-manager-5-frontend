const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginApi(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error("Nieprawidłowy login lub hasło");
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Brak dostępu");
  return res.json();
}

// Orders
export async function getPendingOrders() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/orders?status=pending`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania zamówień");
  return res.json();
}

export async function getOrderDetails(id: number) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/orders/${id}`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Nie znaleziono zamówienia");
  return res.json();
}

// BRAK takiego endpointu w backendzie – wywołanie zwróci błąd!
export async function getOrderEvents(id: number) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/orders/${id}/events`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania historii zamówienia");
  return res.json();
}

// Menu
export async function getMenuItems() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/items`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania menu");
  return res.json();
}

export async function getMenuItem(id: number) {
  const token = localStorage.getItem("token")!;
  // POPRAWKA: używamy path param zamiast query param
  const res = await fetch(`${API_URL}/menu/items/${id}`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Nie znaleziono pozycji menu");
  return res.json();
}

export async function getMenuCategories() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/categories`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania kategorii");
  return res.json();
}

export async function createMenuItem(data: any) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/items`, {
    method: "POST",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd dodawania pozycji");
  return res.json();
}

export async function updateMenuItem(id: number, data: any) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/items/${id}`, {
    method: "PUT",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd edycji pozycji");
  return res.json();
}

// POPRAWKA: POST na /menu/items/{id}/block z query param is_available zgodnie z backendem
export async function blockMenuItem(id: number) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/items/${id}/block?is_available=false`, {
    method: "POST",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Błąd blokowania pozycji");
  return res.json();
}

export async function unblockMenuItem(id: number) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/menu/items/${id}/block?is_available=true`, {
    method: "POST",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Błąd odblokowania pozycji");
  return res.json();
}

// Stats (MAPOWANIE do formatu oczekiwanego przez frontend)
export async function getOrdersDailyStats() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/stats/orders/daily`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania statystyk");
  const data = await res.json();
  // MAPUJEMY backend -> frontend
  // backend: { terminal_stats: [{terminal_name, orders_count}, ...] }
  // frontend oczekuje: [{terminal_name, orders_done}]
  return (data.terminal_stats || []).map((stat: any) => ({
    terminal_name: stat.terminal_name,
    orders_done: stat.orders_count,
  }));
}

export async function getBestsellers() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/stats/menu-items/top`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania bestsellerów");
  const data = await res.json();
  // MAPUJEMY backend -> frontend
  // backend: [{menu_item_id, name, sold_count}, ...]
  // frontend oczekuje: [{name, total}]
  return (data || []).map((item: any) => ({
    name: item.name,
    total: item.sold_count,
  }));
}

// Users – BRAK takich endpointów w backendzie! Wywołanie zwróci błąd!
export async function getUsers() {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/users/`, { headers: authHeader(token) });
  if (!res.ok) throw new Error("Błąd pobierania użytkowników");
  return res.json();
}

export async function deleteUser(id: number) {
  const token = localStorage.getItem("token")!;
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Błąd usuwania użytkownika");
  return res.json();
}
