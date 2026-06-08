# OrientamentoApplicazione

Applicazione mobile (iOS/Android) e web per l'orientamento scolastico, costruita con **Expo SDK 54**, **React Native 0.81**, **Expo Router 6** e **NativeWind**.

L'app permette agli studenti di:
- Sostenere un **quiz orientativo** di 3 domande per scoprire l'indirizzo scolastico più adatto
- Visualizzare i **risultati** con percentuali di compatibilità (Logica, Pratica, Creativa, etc.), statistiche (richiesta lavoro, stipendio, crescita) e prospettive di carriera
- Cercare e consultare **scuole** della Lombardia con filtri per **provincia** e **indirizzo di studio**
- Visualizzare il **calendario Open Days** di ogni scuola
- Esplorare le scuole su una **mappa interattiva** (Leaflet + MapTiler)
- **Chattare con un assistente AI** ("Orientamento AI") per consigli personalizzati sui percorsi di studio
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
- [API Backend](#api-backend)
- [Componenti UI](#componenti-ui)
  - [Componenti Base](#componenti-base)
  - [Componenti Custom](#componenti-custom)
  - [Design System](#design-system)
- [Configurazione](#configurazione)
- [Sviluppo](#sviluppo)
- [Stato del Progetto](#stato-del-progetto)

---

## Tecnologie

| Categoria | Tecnologia |
|---|---|
| **Framework** | Expo SDK 54 |
| **UI** | React Native 0.81.5, React 19.1 |
| **Routing** | Expo Router 6 (file-based) |
| **Styling** | NativeWind 4 (Tailwind CSS per React Native) |
| **Linguaggio** | TypeScript 5.9 |
| **HTTP Client** | Axios (con interceptor JWT e refresh token automatico) |
| **UI Primitives** | @rn-primitives (Avatar, Checkbox, Label, Progress, RadioGroup, Separator, Slot) |
| **Icone** | Lucide React Native, @expo/vector-icons (MaterialCommunityIcons, MaterialIcons) |
| **Mappe** | react-native-leaflet-view (Leaflet + MapTiler via WebView) |
| **Calendario** | react-native-calendars (Open Days) |
| **Storage Sicuro** | expo-secure-store (token JWT) |
| **Animazioni** | react-native-reanimated |
| **Gesture** | react-native-gesture-handler |
| **Haptics** | expo-haptics |
| **Linting** | ESLint + eslint-config-expo |

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
├── app/                              # Expo Router — routing file-based
│   ├── _layout.tsx                   # Root layout (SafeAreaProvider + AuthProvider)
│   ├── index.tsx                     # Schermata di Login / Registrazione
│   │
│   └── (protected)/                  # Route protette (richiedono autenticazione)
│       ├── _layout.tsx               # Guard: reindirizza a / se non autenticato
│       │
│       ├── (tabs)/                   # Schermate principali con tab bar
│       │   ├── _layout.tsx           # Configurazione tab bar (5 tab)
│       │   ├── contenuti.tsx         # Home — dashboard risultati quiz
│       │   ├── scuole.tsx            # Ricerca scuole, filtri, dettaglio, calendario Open Days
│       │   ├── chat.tsx              # Assistente AI "Orientamento AI" (NextStep Bot)
│       │   ├── mappe.tsx             # Mappa interattiva con marker scuole
│       │   └── profilo.tsx           # Profilo utente e impostazioni
│       │
│       └── (modals)/                 # Schermate modali
│           ├── _layout.tsx           # Stack modali
│           └── quiz.tsx              # Quiz orientativo (3 domande)
│
├── assets/
│   ├── images/                       # Icone, splash screen, logo
│   └── leaflet.html                  # HTML embedded per mappa Leaflet
│
├── components/
│   ├── ui/                           # Componenti base riutilizzabili
│   │   ├── avatar.tsx                # Avatar con immagine e fallback iniziali
│   │   ├── badge.tsx                 # Badge / tag colorato
│   │   ├── button.tsx                # Pulsante con varianti
│   │   ├── card.tsx                  # Card con Header, Title, Description, Content, Footer
│   │   ├── checkbox.tsx              # Checkbox accessibile
│   │   ├── contentReusable.tsx       # Componenti custom condivisi (Section, MatchBar, etc.)
│   │   ├── icon.tsx                  # Wrapper Lucide con supporto NativeWind
│   │   ├── input.tsx                 # Input di testo
│   │   ├── label.tsx                 # Etichetta per form
│   │   ├── progress.tsx              # Barra di progresso (web + nativa animata)
│   │   ├── radio-group.tsx           # Gruppo di radio button
│   │   ├── separator.tsx             # Linea di separazione
│   │   └── text.tsx                  # Testo con varianti tipografiche
│   └── json/                         # Configurazione registri componenti
│
├── constants/
│   ├── listaScuole.json              # Dati scuole statici (fallback / demo offline)
│   └── quizResultData.json           # Dati risultati quiz (statici / demo)
│
├── context/
│   └── AuthContext.tsx               # Provider autenticazione (login, register, logout, token, rifaiQuestionario)
│
├── lib/
│   └── utils.ts                      # Utility cn() (clsx + tailwind-merge)
│
├── types/
│   └── user.tsx                      # Definizione tipo User
│
├── utils/
│   └── api.ts                        # Istanza Axios con interceptor JWT e refresh automatico
│
├── app.json                          # Configurazione Expo (splash, icone, plugin, scheme)
├── tailwind.config.js                # Configurazione Tailwind / NativeWind
├── tsconfig.json                     # TypeScript config (extends expo/tsconfig.base)
├── metro.config.js                   # Metro bundler config con NativeWind
├── babel.config.js                   # Babel config (NativeWind preset)
├── global.css                        # Direttive Tailwind (@tailwind base/components/utilities)
├── components.json                   # shadcn/ui registry (style: new-york)
├── AGENTS.md                         # Istruzioni per AI agent (consulta docs Expo v54)
├── CLAUDE.md                         # Riferimento ad AGENTS.md
└── package.json
```

---

## Architettura

### Routing

L'app utilizza **Expo Router 6** con file-based routing organizzato su tre livelli:

```
app/
  _layout.tsx                    ← Root: SafeAreaProvider → AuthProvider → Stack
  index.tsx                      ← Auth Screen (Login / Register)
  (protected)/
    _layout.tsx                  ← Auth guard: redirect a / se !isAuthenticated
    (tabs)/
      _layout.tsx                ← Bottom Tab Navigator (5 tab)
      contenuti.tsx              ← Tab 1: Dashboard risultati quiz
      scuole.tsx                 ← Tab 2: Ricerca, filtri e dettaglio scuole
      chat.tsx                   ← Tab 3: Chat AI "Orientamento AI"
      mappe.tsx                  ← Tab 4: Mappa interattiva scuole
      profilo.tsx                ← Tab 5: Profilo utente
    (modals)/
      _layout.tsx                ← Stack modale
      quiz.tsx                   ← Quiz orientativo (presentato come modale)
```

### Flusso di Autenticazione

```
Avvio App
    │
    ▼
Controlla token JWT in SecureStore
    │
    ├── Token presente? ──► Chiama GET /users/me/
    │                              │
    │                              ├── quizsolved = true ──► Redirect a contenuti
    │                              └── quizsolved = false ──► Redirect a quiz
    │
    └── Token assente? ──► Mostra schermata Login / Register (/)
                                   │
                                   ├── Login ──► POST /login ──► Salva token ──► Redirect
                                   └── Register ──► POST /register ──► Login automatico
```

- Il token JWT è salvato in `expo-secure-store` e allegato automaticamente a ogni richiesta
- Alla ricezione di un 401, l'interceptor Axios tenta il refresh tramite `POST /refresh`
- Se il refresh fallisce, l'utente viene disconnesso e reindirizzato al login
- Il metodo `rifaiQuestionario()` permette di resettare lo stato quiz e ripetere il test

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                        App                              │
│                                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐    │
│  │  Screens  │◄───►│  Context │◄───►│  Axios API   │    │
│  │ (View)    │     │ (state)  │     │ (api.ts)     │    │
│  └──────────┘     └──────────┘     └──────┬───────┘    │
│                                            │            │
│                                     ┌──────┴──────┐     │
│                                     │ JWT Token   │     │
│                                     │ SecureStore │     │
│                                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌──────────────────────────────┐
              │  Backend (FastAPI)           │
              │  http://10.0.1.51:8000       │
              │                              │
              │  - Autenticazione (JWT)      │
              │  - Quiz orientativo          │
              │  - Scuole e posizioni        │
              │  - Chatbot AI                │
              └──────────────────────────────┘
```

---

## API Backend

Base URL: `http://10.0.1.51:8000`

### Endpoint

| Endpoint | Metodo | Descrizione |
|---|---|---|
| `/login` | POST | Login utente (x-www-form-urlencoded) |
| `/register` | POST | Registrazione nuovo utente |
| `/users/me/` | GET | Profilo utente corrente |
| `/refresh` | POST | Refresh token JWT |
| `/acquire/quizQuestions?q={n}` | GET | Domanda n del quiz (n = 0, 1, 2) |
| `/acquire/quizResponses` | POST | Invia risposta al quiz |
| `/quizCompletato` | POST | Segna il quiz come completato |
| `/acquire/scuolePosizione?provincia={XX}` | GET | Elenco scuole con coordinate geografiche |
| `/acquire/chat` | POST | Invia messaggio al chatbot AI (`{ inputText }`) |

### Integrazione Chatbot (`chat.tsx`)

La schermata chat effettua chiamate reali al backend:

```typescript
const risposta = await api.post("/acquire/chat", { inputText });
```

- Invia il testo inserito dall'utente
- Riceve la risposta dall'AI e la mostra in un bubble chat
- Mostra uno stato di caricamento ("Sta scrivendo...")
- Gestione errori con messaggio "Si e' verificato un errore"
- Pulsante "svuota chat" per resettare la conversazione (tranne il primo messaggio)

### Calendario Open Days (`scuole.tsx`)

Il dettaglio scuola include un calendario interattivo con date precalcolate:
- Data corrente (oggi)
- Date marcate a +5 giorni (arancione) e +13 giorni (rosso)
- Navigazione giorni con `onDayPress`

---

## Componenti UI

### Componenti Base (`components/ui/`)

| Componente | Varianti / Props | Uso |
|---|---|---|
| `button.tsx` | default, destructive, outline, secondary, ghost, link + size (default, sm, lg, icon) | Pulsanti in tutta l'app |
| `card.tsx` | Header, Title, Description, Content, Footer | Card risultati, scuole, profilo |
| `text.tsx` | h1, h2, h3, h4, p, large, small, muted | Tutti i testi |
| `badge.tsx` | primary, secondary, destructive, outline + 8 colori specifici | Tag scuola, indirizzi, stati |
| `input.tsx` | native text input con stili nativi | Form login/register, ricerca |
| `progress.tsx` | valore 0-100, indicator animato | Barra progresso quiz |
| `radio-group.tsx` | RadioGroup + RadioGroupItem con indicator | Opzioni quiz |
| `checkbox.tsx` | Checkbox accessibile con label | Filtri |
| `avatar.tsx` | Avatar + AvatarFallback (iniziali) | Profilo utente, chat |
| `separator.tsx` | Linea di separazione orizzontale | Divisore sezioni |
| `icon.tsx` | Lucide React Native wrapper | Icone in tutta l'app |
| `label.tsx` | Testo label per form | Etichette input |

### Componenti Custom (`contentReusable.tsx`)

| Componente | Descrizione |
|---|---|
| `Section` | Contenitore sezione con icona, titolo e children |
| `MatchBar` | Barra compatibilità orizzontale animata (con etichetta e percentuale) |
| `StatCard` | Card statistica con numero grande (es. richiesta lavoro, stipendio) |
| `AltRow` | Riga alternativa di indirizzo compatibile |
| `BottomNavBar` | Barra navigazione inferiore (Home, Scuole, Bot, Mappe, Profilo) |
| `SearchBar` | Barra di ricerca con submit e clear |

### Design System

```
Colori:
  Primary:       #066CF4 (blu)
  Sfondo:        #F5F7FA (grigio chiaro)
  Card/Superfici: #FFFFFF (bianco)
  Bordi:         #CCDFFD (blu chiaro)
  Testo primario: #0B131F (scuro)
  Testo secondario: #65758C (medio)
  Testo terziario: #556070 (chiaro)

Tipografia:
  h1: text-3xl font-bold
  h2: text-2xl font-bold
  h3: text-xl font-semibold
  h4: text-base font-semibold
  p:  text-sm text-secondary
  muted: text-sm text-muted-foreground
```

---

## Configurazione

### API Base URL

Modifica in `utils/api.ts`:

```typescript
const API_BASE_URL = 'http://<indirizzo-ip>:8000';
```

### Mappa (MapTiler)

La mappa Leaflet utilizza MapTiler. Per cambiare la tile key, modifica in:
- `app/(protected)/(tabs)/mappe.tsx`
- `assets/leaflet.html`

### Tema Colori

I colori sono definiti come classi NativeWind in `tailwind.config.js` e utilizzati inline nei componenti.

---

## Sviluppo

### Convenzioni

- **Linguaggio:** TypeScript con path alias `@/*` (es. `@/components/ui/button`)
- **Stile:** NativeWind (classi Tailwind), niente `StyleSheet.create`
- **Routing:** File-based (ogni file in `app/` è una route)
- **UI:** Tutta l'interfaccia è in italiano
- **Componenti:** Preferire componenti già esistenti in `components/ui/` prima di crearne di nuovi

### Comandi Utili

```bash
npx expo start            # Avvia sviluppo con Expo
npx expo start --web      # Avvia per browser
npx expo run:android      # Build ed esecuzione su Android
npx expo run:ios          # Build ed esecuzione su iOS
npm run lint              # Verifica linting
```

### Struttura di una Scena

```
app/(protected)/(tabs)/scuole.tsx
├── imports (React, Expo Router, componenti UI, API, costanti)
├── definizione tipi (TypeScript interfaces)
├── funzioni di utilità (getSchoolIcon, filtri, formattazione)
├── componenti interni (SearchBar, Filters, SchoolCard, SchoolDetail)
├── schermata principale esportata
└── stili (classi NativeWind inline)
```

---

## Stato del Progetto

| Funzionalità | Stato |
|---|---|
| Autenticazione (login/register con JWT) | ✅ Completato |
| Refresh token automatico | ✅ Completato |
| Quiz orientativo (3 domande) | ✅ Completato |
| Dashboard risultati (match bar, statistiche) | ✅ Completato |
| Ricerca scuole con filtri (provincia, indirizzo) | ✅ Completato |
| Dettaglio scuola (info, indirizzi, calendario Open Days) | ✅ Completato |
| Mappa interattiva (Leaflet + MapTiler, marker, card animata) | ✅ Completato |
| Chatbot AI "Orientamento AI" (con API reale) | ✅ Completato |
| Profilo utente (dati, stato quiz, logout) | ✅ Completato |
| Keyboard dismiss (tap fuori dalla tastiera) | ✅ Completato |
| Icone dinamiche scuole (basate sul corso) | ✅ Completato |
| Dati risultati quiz da backend (vs statici) | ⏳ Da implementare |
| Test automatizzati | ⏳ Da implementare |
| Chatbot con streaming risposte | ⏳ Migliorabile |
