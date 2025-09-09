# Jak wdrożyć frontend (React) na Azure App Service – łatwa instrukcja

Ta instrukcja przeprowadzi Cię **krok po kroku** przez publikację Twojego frontendu (React, Vite, Create React App itp.) na Azure App Service.  
**Nie musisz mieć doświadczenia – po prostu wykonaj poniższe kroki!**

---

## 1. Przygotuj aplikację

1. **Upewnij się, że aplikacja działa lokalnie**
    ```bash
    npm install
    npm run build
    ```
   - Folder `dist` (Vite) lub `build` (CRA) powinien się pojawić i zawierać pliki `.js`, `.html` itp.

2. **Plik konfiguracyjny środowiska**  
   - Jeśli Twój frontend korzysta z backendu na Azure, ustaw w `.env`:
     ```
     VITE_API_URL=https://twoj-backend.azurewebsites.net
     ```
   - Po zmianie `.env` wykonaj ponownie `npm run build`.

---

## 2. Umieść kod na GitHubie

- Zatwierdź (commit) i wypchnij (push) swój projekt na GitHub (np. do repozytorium `restaurant-manager-frontend`).

---

## 3. Utwórz aplikację w Azure

1. **Zaloguj się** na [portal.azure.com](https://portal.azure.com/).
2. W menu po lewej kliknij **App Services** → **+ Create**.
3. Wypełnij podstawowe dane:
   - **Nazwa:** np. `rest-manager-frontend`
   - **System operacyjny:** Linux
   - **Region:** najbliższy Tobie
   - **Plan:** najtańszy na początek (np. F1/Free, B1)
   - Potwierdź i poczekaj na utworzenie.

---

## 4. Skonfiguruj automatyczne wdrażanie z GitHub

1. W nowej aplikacji wybierz **Deployment Center**.
2. Wybierz:
   - **Source:** GitHub
   - **Build provider:** GitHub Actions
   - Połącz konto, wybierz repozytorium i gałąź (np. `main`).
3. Azure sam zaproponuje plik workflow. Zatwierdź i kliknij **Save**.

---

## 5. Skonfiguruj środowisko produkcyjne

1. Wejdź w **Configuration** → **Application settings**.
2. Jeśli korzystasz z `.env`, możesz tu dodać np.:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://twoj-backend.azurewebsites.net`
3. Zapisz i zrestartuj aplikację.

---

## 6. (Opcjonalnie) Skonfiguruj statyczny serwer

- **Domyślnie Azure App Service dla aplikacji Node/React** sam rozpozna i serwuje folder produkcyjny.
- Jeśli korzystasz z Vite, utwórz plik `staticwebapp.config.json` lub dodaj plik `web.config` (dla przekierowań SPA).
- Przykład pliku do obsługi SPA (umieść w katalogu `public/`):

  ```json name=public/staticwebapp.config.json
  {
    "routes": [
      {
        "route": "/*",
        "serve": "/index.html",
        "statusCode": 200
      }
    ]
  }
  ```

---

## 7. Pierwsze wdrożenie

- Po połączeniu z GitHub Actions, **każdy push** do tej gałęzi automatycznie zainicjuje build i deploy.
- Postęp możesz śledzić w zakładce **Deployment Center → Logs**.

---

## 8. Sprawdź aplikację

- Po udanym wdrożeniu znajdziesz adres URL w **Overview** → **Default domain** (np. `https://rest-manager-frontend.azurewebsites.net`).
- Wejdź pod ten adres – aplikacja powinna się wyświetlić.

---

## Najczęstsze problemy

- **Biały ekran:** Upewnij się, że build przeszedł poprawnie i masz przekierowania dla SPA.
- **Brak połączenia z backendem:** Sprawdź czy `VITE_API_URL` wskazuje na działający backend i jest dostępny z internetu.
- **Zmiany w `.env` nie widać:** Po zmianie zmiennych środowiskowych na Azure, zrób ponowny deploy (np. przez nowy push lub restart App Service).

---

## Gotowe!

Gratulacje! Twój frontend działa w Azure 🎉  
Każda nowa wersja (push do GitHub) będzie automatycznie publikowana.

---

### Jeśli masz pytania lub coś nie działa – napisz do osoby technicznej lub poszukaj pomocy na forum Azure/Stack Overflow.
