# OrientamentoApplicazione

Applicazione mobile (iOS/Android) e web per l'orientamento scolastico, costruita con **Expo SDK 54**, **React Native 0.81**, **Expo Router 6** e **NativeWind**.

L'app permette agli studenti di:
- Sostenere un **quiz orientativo** per scoprire l'indirizzo scolastico più adatto
- Visualizzare i **risultati** con percentuali di compatibilità, statistiche e prospettive di carriera
- Cercare e consultare **scuole** in Lombardia con filtri per provincia e indirizzo
- Visualizzare le scuole su una **mappa interattiva**
- **Chattare con un assistente AI** ("NextStep Bot") per consigli sui percorsi di studio
- Gestire il proprio **profilo** e ripetere il test

---

## Indice

- [Tecnologie](#tecnologie)
- [Prerequisiti](#prerequisiti)
- [Installazione e Avvio](#installazione-e-avvio)
- [Scripts Disponibili](#scripts-disponibili)
- [Struttura del Progetto](#struttura-del-progetto)
- [Architettura](#architettura)
  - [Routing](#routing)
  - [Flusso di Autenticazione](#flusso-di-autenticazione)
  - [Data Flow](#data-flow)
- [Componenti UI](#componenti-ui)
- [API Backend](#api-backend)
- [Configurazione](#configurazione)
- [Sviluppo](#sviluppo)

---

## Tecnologie

| Categoria | Tecnologia |
|---|---|
| **Framework** | Expo SDK 54 |
| **UI** | React Native 0.81.5, React 19.1 |
| **Routing** | Expo Router 6 (file-based) |
| **Styling** | NativeWind 4 (Tailwind CSS per React Native) |
| **Linguaggio** | TypeScript 5.9 |
| **HTTP Client** | Axios |
| **UI Primitives** | @rn-primitives (Avatar, Checkbox, Progress, RadioGroup, Separator) |
| **Icone** | Lucide React Native, @expo/vector-icons (MaterialCommunityIcons) |
| **Mappe** | react-native-leaflet-view (WebView + Leaflet + MapTiler) |
| **Calendario** | react-native-calendars |
| **Storage** | expo-secure-store (token JWT) |
| **Animazioni** | react-native-reanimated |
| **Linting** | ESLint + expo-config |

---

## Prerequisiti

- Node.js 18+
- npm
- Expo CLI (`npx expo`)
- Per lo sviluppo nativo: Android Studio (Android) o Xcode (iOS)

---

## Installazione e Avvio

```bash
# 1. Clona il repository
git clone <url-repository>
cd OrientamentoApplicazione

# 2. Installa le dipendenze
npm install

# 3. Avvia l'app
npx expo start
```

Scansiona il QR code con **Expo Go** (iOS/Android) o premi `w` per aprire nel browser.

---

## Scripts Disponibili

| Comando | Descrizione |
|---|---|
| `npm start` | Avvia Expo in modalità sviluppo |
| `npm run web` | Avvia Expo per il web |
| `npm run android` | Avvia su emulatore Android |
| `npm run ios` | Avvia su simulatore iOS |
| `npm run lint` | Esegue ESLint su tutto il progetto |

---

## Struttura del Progetto

```
OrientamentoApplicazione/
│
├── app/                          # Expo Router — routing file-based
│   ├── _layout.tsx               # Root layout (SafeAreaProvider + AuthProvider)
│   ├── index.tsx                 # Schermata di Login/Registrazione
│   │
│   └── (protected)/              # Route protette (richiedono autenticazione)
│       ├── _layout.tsx           # Guard: reindirizza a / se non autenticato
│       │
│       ├── (tabs)/               # Schermate principali con tab bar
│       │   ├── _layout.tsx       # Configurazione tab bar (5 tab)
│       │   ├── contenuti.tsx     # Home — dashboard risultati quiz
│       │   ├── scuole.tsx        # Ricerca e dettaglio scuole
│       │   ├── chat.tsx          # Assistente AI (NextStep Bot)
│       │   ├── mappe.tsx         # Mappa interattiva scuole
│       │   └── profilo.tsx       # Profilo utente
│       │
│       └── (modals)/             # Schermate modali
│           ├── _layout.tsx       # Stack modali
│           └── quiz.tsx          # Quiz orientativo (3 domande)
│
├── assets/
│   ├── images/                   # Icone, splash, logo
│   └── leaflet.html              # HTML embedded per mappa Leaflet
│
├── components/
│   ├── ui/                       # Componenti base riutilizzabili
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── contentReusable.tsx   # Componenti custom condivisi
│   │   ├── icon.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── separator.tsx
│   │   └── text.tsx
│   └── json/                     # Config registri componenti
│
├── constants/
│   ├── listaScuole.json          # Dati scuole statici (fallback/demo)
│   └── quizResultData.json       # Dati risultati quiz (static/demo)
│
├── context/
│   └── AuthContext.tsx            # Provider autenticazione (login, register, logout, token)
│
├── lib/
│   └── utils.ts                  # Utility cn() (clsx + tailwind-merge)
│
├── types/
│   └── user.tsx                  # Definizione tipo User
│
├── utils/
│   └── api.ts                    # Istanza Axios con interceptor JWT
│
├── app.json                      # Configurazione Expo
├── tailwind.config.js            # Configurazione Tailwind / NativeWind
├── tsconfig.json                 # TypeScript config
├── metro.config.js               # Metro bundler config
├── babel.config.js               # Babel config
├── global.css                    # Direttive Tailwind
├── components.json               # shadcn/ui registry
└── package.json
```

---

## Architettura

### Routing

L'app utilizza **Expo Router 6** con file-based routing. La struttura è organizzata in tre livelli:

```
app/
  _layout.tsx                   ← Root: SafeAreaProvider → AuthProvider → Stack
  index.tsx                     ← Auth Screen (Login / Register)
  (protected)/
    _layout.tsx                 ← Auth guard: redirect a / se !isAuthenticated
    (tabs)/
      _layout.tsx               ← Bottom Tab Navigator (5 tab)
      contenuti.tsx             ← Tab 1: Dashboard risultati quiz
      scuole.tsx                ← Tab 2: Ricerca scuole
      chat.tsx                  ← Tab 3: Chat AI
      mappe.tsx                 ← Tab 4: Mappa
      profilo.tsx               ← Tab 5: Profilo
    (modals)/
      _layout.tsx               ← Stack modale
      quiz.tsx                  ← Quiz (presentato come modale)
```

### Flusso di Autenticazione

1. All'avvio, l'app controlla la presenza di un **JWT token** in `expo-secure-store`
2. Se il token esiste, recupera il profilo utente da `/users/me/`
3. Se l'utente ha `quizsolved: true` → redirect a `contenuti` (dashboard)
4. Se `quizsolved: false` → redirect al `quiz` modale
5. Le route sotto `(protected)/` reindirizzano a `/` se l'utente non è autenticato
6. Login/Register su `app/index.tsx`

### Data Flow

```
┌─────────┐     ┌──────────┐     ┌──────────────┐
│  View   │◄───►│  Context │◄───►│  Axios API   │◄───► Backend
│ (screens)│     │ (state)  │     │ (utils/api.ts)│     (http://10.0.1.51:8000)
└─────────┘     └──────────┘     └──────────────┘
                                       │
                                 ┌─────┴──────┐
                                 │ JWT Token   │
                                 │ SecureStore │
                                 └────────────┘
```

- **API Layer:** Axios instance con base URL `http://10.0.1.51:8000`, auto-attach del token JWT tramite interceptor
- **Token Refresh:** Alla ricezione di un 401, viene automaticamente chiamato `/refresh` per rinnovare il token
- **State Management:** React Context per auth; stato locale per UI
- **Quiz:** Le risposte vengono inviate al backend dopo ogni domanda

---

## Componenti UI

### Componenti Base (`components/ui/`)

| Componente | Descrizione |
|---|---|
| `avatar.tsx` | Avatar con immagine e fallback iniziali |
| `badge.tsx` | Badge / tag colorato |
| `button.tsx` | Pulsante con varianti (default, destructive, outline, secondary, ghost, link) |
| `card.tsx` | Card con Header, Title, Description, Content, Footer |
| `checkbox.tsx` | Checkbox accessibile |
| `contentReusable.tsx` | Componenti custom: Section, MatchBar, StatCard, AltRow, BottomNavBar, SearchBar |
| `icon.tsx` | Wrapper Lucide con supporto NativeWind |
| `input.tsx` | Input di testo |
| `label.tsx` | Etichetta per form |
| `progress.tsx` | Barra di progresso (web + nativa animata) |
| `radio-group.tsx` | Gruppo di radio button |
| `separator.tsx` | Linea di separazione |
| `text.tsx` | Testo con varianti tipografiche (h1-h4, p, large, small, muted) |

### Design System

- **Colore primario:** `#066CF4` (blu)
- **Sfondo:** `#F5F7FA` (grigio chiaro)
- **Card:** `#FFFFFF` (bianco)
- **Bordi:** `#CCDFFD` (blu chiaro)
- **Testo primario:** `#0B131F` (scuro)
- **Testo secondario:** `#65758C` (medio)
- **Testo terziario:** `#556070` (chiaro)

---

## API Backend

Base URL: `http://10.0.1.51:8000`

| Endpoint | Metodo | Descrizione |
|---|---|---|
| `/login` | POST | Login utente (x-www-form-urlencoded) |
| `/register` | POST | Registrazione utente |
| `/users/me/` | GET | Profilo utente corrente |
| `/refresh` | POST | Refresh token JWT |
| `/acquire/quizQuestions?q=N` | GET | Domanda N del quiz |
| `/acquire/quizResponses` | POST | Invia risposta quiz |
| `/quizCompletato` | POST | Segna quiz come completato |
| `/acquire/scuolePosizione?provincia=XX` | GET | Elenco scuole con coordinate |

---

## Configurazione

### API Base URL

Modifica in `utils/api.ts`:

```typescript
const API_BASE_URL = 'http://<indirizzo>:8000';
```

### Mappa (MapTiler API Key)

Modifica in `app/(protected)/(tabs)/mappe.tsx` e `assets/leaflet.html`:

```javascript
tileLayer('https://api.maptiler.com/maps/.../{z}/{x}/{y}.png?key=<YOUR_KEY>')
```

### Tema Colori

I colori sono definiti in `tailwind.config.js` e nei componenti tramite classi NativeWind.

---

## Sviluppo

### Convenzioni

- **Linguaggio:** TypeScript con path alias `@/*` (es. `@/components/ui/button`)
- **Stile:** NativeWind classi Tailwind, niente StyleSheet.create
- **File-Based Routing:** Ogni file in `app/` è una route
- **Italian:** Tutta l'interfaccia utente è in italiano

### Comandi Utili

```bash
npx expo start           # Avvia sviluppo
npm run lint             # Verifica linting
npx expo run:android     # Build per Android
npx expo run:ios         # Build per iOS
```

### Struttura di una Scena

```
app/(protected)/(tabs)/scuole.tsx
├── imports (React, Expo Router, componenti UI, API, costanti)
├── definizione tipi (TypeScript interfaces)
├── componenti interni (SearchBar, Filters, SchoolCard, SchoolDetail)
├── schermata principale (ScuoleScreen)
└── stili (classi NativeWind inline)
```

---

## Stato del Progetto

- ✅ Autenticazione (login/register/JWT con refresh)
- ✅ Quiz orientativo (3 domande)
- ✅ Dashboard risultati (dati statici/demo)
- ✅ Ricerca scuole con filtri
- ✅ Mappa interattiva (Leaflet + MapTiler)
- ✅ Chat AI (interfaccia, backend da collegare)
- ✅ Profilo utente
- ⏳ Collegamento chat a API backend AI
- ⏳ Dati risultati quiz da backend (attualmente statici)
- ⏳ Test automatizzati
