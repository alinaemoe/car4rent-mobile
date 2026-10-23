# Car4Rent Mobile

**The customer and car-owner app: find a car on a map, book it, track the trip - or list your own car and watch your income.**

## The Car4Rent system

| Repo | Role | Stack |
|---|---|---|
| **car4rent-backend** | REST API, auth, bookings, payments ledger, media | NestJS 11, TypeORM, PostgreSQL |
| **car4rent-mobile** | Customer and car-owner app (Android / iOS) | Expo / React Native, Redux Toolkit, TanStack Query |
| **car4rent-admin** | Back-office for managers | Refine 5, MUI 6, React Three Fiber |
| **car4rent-landing** | Public marketing site and lead capture | React 19, Vite, i18next, Framer Motion |

Car4Rent is a peer-to-peer and fleet **car rental platform** built as a diploma project: clients search
and book cars, owners publish and manage theirs, and managers run the whole thing from the admin panel.

## Features

- **Catalogue** with infinite scroll, a rich filter system (brand, body type, transmission, fuel,
  price range, features, dates) and a **map view** (`react-native-maps`).
- **Booking flow:** calendar -> car detail (gallery, specs, reviews, location) -> checkout -> success.
- **My rentals** with status tracking and cancellation, transaction history, favorites that persist
  offline.
- **Owner mode:** *My fleet* (show/hide cars), per-car stats and monthly income, partnership
  application with photos.
- **Account:** email OTP registration (3-step flow), login with silent token refresh, guest mode,
  password reset, passport / driver-licence upload for verification.
- **Car condition photos** before and after the rental.
- **Multilingual**, light/dark theme, right-side drawer + bottom tabs (22 screens).

## Stack

Expo SDK 54, React Native 0.81, Expo Router (file-based navigation), Redux Toolkit (auth, filters,
favorites, dictionaries), TanStack Query (data fetching and caching), React Hook Form + Zod, Axios with
a refresh-token interceptor, i18next.

## Run

```bash
cp .env.example .env     # GOOGLE_MAPS_API_KEY (Android map) and EXPO_PUBLIC_API_URL (backend)
npm install
npx expo start           # or: npx expo run:android
```

Point `EXPO_PUBLIC_API_URL` at your Car4Rent API (the Android-emulator default is `http://10.0.2.2:3000`).
Restrict the Maps key by package name and SHA-1 in Google Cloud Console.