# Instrukcja: Jak wdrożyć backend FastAPI do Azure App Service

Ta instrukcja poprowadzi Cię krok po kroku przez proces uruchomienia projektu FastAPI (np. ten repozytorium) w chmurze Microsoft Azure, nawet jeśli nigdy wcześniej tego nie robiłeś.

---

## Krok 1: Załóż konto na Azure

1. Przejdź na [portal Azure](https://portal.azure.com/).
2. Zarejestruj się lub zaloguj.
3. Jeśli nie masz jeszcze subskrypcji, możesz skorzystać z darmowego konta lub dodać kartę płatniczą.

---

## Krok 2: Utwórz usługę **Azure App Service**

1. W menu po lewej kliknij "**App Services**", a następnie "**+ Create**".
2. Wybierz subskrypcję, Resource Group (możesz utworzyć nową np. `restaurant-manager-rg`).
3. Nazwij aplikację (np. `rest-manager-backend`).
4. Wybierz **runtime stack**: Python 3.11.
5. System operacyjny: **Linux**.
6. Wybierz region (najlepiej najbliżej użytkowników, np. `West Europe`).
7. Wybierz lub utwórz Plan App Service (najtańszy na początek: B1/Free).
8. Kliknij "**Review + create**", potem "**Create**".

---

## Krok 3: Utwórz bazę danych PostgreSQL (jeśli nie masz własnej)

1. W menu po lewej kliknij "**Azure Database for PostgreSQL**" → "**+ Create**".
2. Skonfiguruj:  
   - Resource Group: ta sama co aplikacja  
   - Nazwa serwera (np. `rest-manager-db`)  
   - Ustaw hasło administratora i zapisz je!
   - Wybierz wersję (np. 13 lub 14).
   - Zaznacz najtańszą opcję rozmiaru.
3. Po utworzeniu odszukaj **connection string** do bazy danych.

---

## Krok 4: Przygotuj repozytorium GitHub

1. Upewnij się, że Twój kod jest na GitHubie.
2. Musi być tam plik `requirements.txt` oraz pliki projektu FastAPI.

---

## Krok 5: Skonfiguruj połączenie z bazą danych w Azure

1. Wejdź w **Settings** → **Configuration** w Twojej usłudze App Service.
2. Dodaj nową zmienną środowiskową:
   - **Name:** `DATABASE_URL`
   - **Value:** Connection string do bazy, np.:  
     ```
     postgresql+psycopg2://<user>:<password>@<server>:5432/<dbname>
     ```
   - Przykład z Azure:  
     ```
     postgresql+psycopg2://restuser:TwojeHaslo@rest-manager-db.postgres.database.azure.com:5432/restaurant
     ```
3. Zapisz zmiany.

---

## Krok 6: Skonfiguruj automatyczne wdrożenie z GitHub Actions

1. W repozytorium na GitHubie znajdź plik w `.github/workflows/` np. `main_rest-manager-backend.yml`.
2. W Azure App Service, w zakładce **Deployment Center** wybierz **GitHub** jako źródło kodu, połącz konto i wybierz repozytorium oraz gałąź (np. `main`).
3. W **App Service** → **Deployment Center** kliknij **Manage publish profile** i pobierz plik publish profile.

---

## Krok 7: Dodaj sekret do GitHub

1. W repozytorium na GitHub wejdź w **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Nazwij sekret np. `AZUREAPPSERVICE_PUBLISHPROFILE_....` (tak jak w pliku workflow).
3. Wklej zawartość pliku publish profile z Azure.

---

## Krok 8: (Opcjonalnie) Zmień konfigurację uruchamiania w Azure

1. W **App Service** → **Configuration** → **Startup Command** wpisz:
   ```
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```
2. Zapisz i zrestartuj usługę.

---

## Krok 9: Pierwsze wdrożenie

1. Zatwierdź (`git push`) zmiany na główną gałąź repozytorium.
2. GitHub Actions automatycznie zbuduje i wdroży aplikację do Azure.
3. W **App Service** → **Overview** znajdziesz **URL aplikacji** (np. `https://rest-manager-backend.azurewebsites.net`).

---

## Krok 10: Testowanie

1. Odwiedź podany adres URL.
2. Możesz wejść na `/docs`, aby zobaczyć dokumentację API FastAPI.

---

## Najczęstsze Problemy

- **Błąd bazy:** Sprawdź, czy `DATABASE_URL` jest poprawny i czy baza pozwala na połączenia z Azure App Service.
- **Brak zależności:** Upewnij się, że wszystkie biblioteki są w `requirements.txt`.
- **Błąd autoryzacji:** Sprawdź czy konfiguracja OAuth2 w FastAPI jest poprawna.
- **Brak pliku startowego:** W Azure sprawdź, czy plik nazywa się `app/main.py` i aplikacja jest pod `app`.

---

## Gotowe!

Masz backend FastAPI dostępny publicznie w Azure 🎉  
Możesz teraz podłączyć frontend lub inne systemy do Twojego API.

---

**Wskazówki:**  
- Azure może wymagać kilku minut na pierwsze uruchomienie.
- Pamiętaj o zabezpieczeniu endpointów produkcyjnych!
- Skonfiguruj CORS, jeśli frontend jest na innym adresie niż backend.
