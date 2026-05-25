# OrientamentoApplicazione

Applicazione mobile e web costruita con Expo e React Native.

## Avvio

1. Installa le dipendenze
```bash
   npm install
```

2. Avvia l'app
```bash
   npx expo start
```

## Struttura del progetto

Il progetto usa il file-based routing di Expo Router:
app/
├── _layout.tsx           ← root layout (SafeAreaProvider + AuthProvider)
├── (protected)/
│   ├── _layout.tsx       ← guard: redirect a /login se non autenticato
│   ├── (tabs)/           ← schermate principali con tab bar
│   └── (modals)/         ← schermate modali
└── login.tsx             ← schermata di login (da implementare)
context/
└── AuthContext.tsx       ← provider di autenticazione

## Autenticazione

L'autenticazione è gestita tramite un `AuthProvider` che wrappa l'intera app in `app/_layout.tsx`.

Tutte le route dentro `(protected)/` sono automaticamente protette: se `isAuthenticated` è `false`, l'utente viene reindirizzato a `/login`.

Al momento `isAuthenticated` è impostato a `true` di default — la logica reale di login/logout verrà implementata successivamente modificando solo `context/AuthContext.tsx`, senza toccare il resto dell'app.