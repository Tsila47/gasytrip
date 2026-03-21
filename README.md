# GasyTrip — Covoiturage à Madagascar

> Plateforme fullstack de covoiturage : recherche, réservation et gestion de trajets à Madagascar.

![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20React%20Router%20v6-61DAFB?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?style=flat-square&logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square)
![Tailwind](https://img.shields.io/badge/Style-Tailwind%20CSS%20v4-38BDF8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)

---

## Liens

- **Frontend** : https://gasytrip.vercel.app
- **Backend** : https://gasytrip-api.onrender.com
- **Health check** : https://gasytrip-api.onrender.com/api/health

---

## Sommaire

- [Aperçu fonctionnel](#aperçu-fonctionnel)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Routes frontend](#routes-frontend)
- [API Endpoints](#api-endpoints)
- [Déploiement](#déploiement)
- [Créer un compte Admin](#créer-un-compte-admin)
- [Améliorations futures](#améliorations-futures)

---

## Aperçu fonctionnel

| Rôle | Fonctionnalités
| Visiteur | Rechercher un trajet, voir le détail |
| Utilisateur connecté | Réserver, annuler, publier un trajet |
| Conducteur | Voir ses passagers, annuler ses trajets |
| Admin | Gérer users, trajets et réservations via dashboard |

---

## Stack technique

| Couche | Technologie |
| Frontend | React 18, React Router v6, Axios, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Base de données | MySQL 8 (`mysql2/promise`) |
| Authentification | JWT (`jsonwebtoken` + `bcrypt`) |
| Déploiement frontend | Vercel |
| Déploiement backend | Render |
| Base de données prod | Railway (MySQL) |

---

## Structure du projet

```
gasytrip/
├── covoiturage-front/                   # Frontend React + Vite
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/
│       │   ├── gasyTrip.png             # Image hero
│       │   └── cities/                  # Photos des villes
│       │       ├── Antananarivo.jpg
│       │       ├── Toamasina.jpg
│       │       ├── Diego.jpg
│       │       ├── Mahajanga.jpg
│       │       ├── Fianara.jpg
│       │       ├── Tulear.jpg
│       │       └── Morondava.jpg
│       ├── compenents/
│       │   ├── Navbar.jsx               # Navbar responsive + hamburger mobile
│       │   ├── ProtectedRoute.jsx       # Guard JWT (auth + expiration + admin)
│       │   ├── CityCarousel.jsx         # Carousel auto-scroll des villes
│       │   └── Footer.jsx               # Footer minimaliste
│       ├── context/
│       │   └── AuthContext.jsx          # Source de vérité auth (token + user)
│       ├── pages/
│       │   ├── HomePage.jsx             # Accueil + formulaire recherche + hero
│       │   ├── LoginPage.jsx            # Connexion
│       │   ├── RegisterPage.jsx         # Inscription
│       │   ├── RideListPage.jsx         # Résultats de recherche
│       │   ├── RideDetailPage.jsx       # Détail trajet + réservation
│       │   ├── MyBookingsPage.jsx       # Mes réservations (passager)
│       │   ├── MyRidesPage.jsx          # Mes trajets (conducteur)
│       │   ├── CreateRidePage.jsx       # Publier un trajet
│       │   └── AdminDashboardPage.jsx   # Dashboard admin
│       ├── services/
│       │   └── api.js                   # Instance Axios + intercepteurs token
│       ├── index.css                    # @import "tailwindcss"
│       └── main.jsx                     # BrowserRouter + AuthProvider + Routes
│
├── covoiturage-back/                    # Backend Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Pool MySQL (mysql2/promise + SSL)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # register, login
│   │   │   ├── rides.controller.js      # CRUD trajets + réservations
│   │   │   └── admin.controller.js      # Gestion users/rides/bookings
│   │   ├── middleware/
│   │   │   └── auth.middleware.js       # JWT verify + requireAdmin
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── rides.routes.js
│   │   │   └── admin.routes.js
│   │   └── server.js                    # Express + CORS + routes
│   ├── schema.sql                       # Script création des tables MySQL
│   ├── .env                             # Variables locales (ne pas commiter)
│   ├── .env.example                     # Template sans valeurs sensibles
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## Installation locale

### Prérequis

- Node.js >= 18
- MySQL >= 8 actif en local
- npm
- Fish shell ou bash

### 1. Cloner le projet

```bash
git clone https://github.com/Tsila47/gasytrip.git
cd gasytrip
```

### 2. Installer les dépendances

```bash
# Backend
cd covoiturage-back && npm install

# Frontend
cd ../covoiturage-front && npm install
```

### 3. Configurer l'environnement

```bash
cd covoiturage-back
cp .env.example .env
# Éditer .env avec tes valeurs locales
```

### 4. Créer la base de données

```bash
mysql -u root -p < covoiturage-back/schema.sql
```

### 5. Lancer l'application

```bash
# Terminal 1 — Backend sur http://localhost:4000
cd covoiturage-back && npm run dev

# Terminal 2 — Frontend sur http://localhost:5173
cd covoiturage-front && npm run dev
```

---

## Variables d'environnement

### `/covoiturage-back/.env.example`

```env
# Serveur
PORT=4000
NODE_ENV=development

# MySQL
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=covoiturage
DB_PORT=3306

# JWT
JWT_SECRET=CHANGE_ME_super_secret_long_random_string
JWT_EXPIRES_IN=1d

# CORS
CLIENT_URL=http://localhost:5173
```

### `/covoiturage-front/.env`

```env
VITE_API_URL=http://localhost:4000
```

> En production, `VITE_API_URL` pointe vers l'URL Render du backend.

---

## Base de données

### Tables

```
users       id, name, email, password_hash, phone, role, is_active, created_at
vehicles    id, user_id →users, brand, model, plate (unique), seats, created_at
rides       id, driver_id →users, vehicle_id →vehicles,
            departure_city, arrival_city, departure_datetime,
            price, seats_total, seats_available, status, description, created_at
bookings    id, ride_id →rides, passenger_id →users,
            seats_booked, status, created_at
```

### Points notables

- `BIGINT UNSIGNED AUTO_INCREMENT` pour tous les IDs
- Index composite `(departure_city, arrival_city, departure_datetime)` sur `rides`
- Contraintes CHECK : `seats_total > 0`, `seats_available >= 0`, `price >= 0`
- `ON DELETE CASCADE` : vehicles → users, bookings → rides
- `ON DELETE RESTRICT` : rides → users

### Initialiser en local

```bash
mysql -u root -p < covoiturage-back/schema.sql
```

---

## Routes frontend

| Route | Page | Accès |
|---|---|---|
| `/` | `HomePage` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/rides` | `RideListPage` | Public |
| `/rides/:id` | `RideDetailPage` | Public |
| `/me/reservations` | `MyBookingsPage` | Connecté |
| `/me/rides` | `MyRidesPage` | Connecté |
| `/me/rides/new` | `CreateRidePage` | Connecté |
| `/admin` | `AdminDashboardPage` | Admin uniquement |

---

## API Endpoints

Base URL production : `https://gasytrip-api.onrender.com/api`

### Auth

| Méthode | Route | Body | Auth |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password, phone? }` | Non |
| POST | `/auth/login` | `{ email, password }` | Non |

### Trajets

| Méthode | Route | Params / Body | Auth |
|---|---|---|---|
| GET | `/rides` | `?from=&to=&date=&seats=&price_max=` | Non |
| GET | `/rides/:id` | — | Non |
| POST | `/rides` | `{ vehicle_id, departure_city, arrival_city, departure_datetime, price, seats_total, description? }` | Oui |
| GET | `/rides/me/rides` | — | Oui |
| GET | `/rides/me/bookings` | — | Oui |
| POST | `/rides/:id/bookings` | `{ seats_booked }` | Oui |
| DELETE | `/rides/bookings/:id` | — | Oui |

### Admin

| Méthode | Route | Auth |
|---|---|---|
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/:id/disable` | Admin |
| GET | `/admin/rides` | Admin |
| DELETE | `/admin/rides/:id` | Admin |
| GET | `/admin/bookings` | Admin |

---

## Déploiement

### Architecture

```
GitHub (Tsila47/gasytrip)
  ├── covoiturage-front  ──►  Vercel   (React + Vite)
  └── covoiturage-back   ──►  Render   (Express)
                                │
                                └──►  Railway  (MySQL)
```

### Frontend — Vercel

- Framework : **Vite**
- Root directory : `covoiturage-front`
- Variable : `VITE_API_URL=https://gasytrip-api.onrender.com`

### Backend — Render

- Root directory : `covoiturage-back`
- Build : `npm install`
- Start : `node src/server.js`
- Variables : `NODE_ENV`, `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`

### Base de données — Railway

- MySQL 8
- Host public : `ballast.proxy.rlwy.net`
- Import du schema via terminal mysql

---

## Créer un compte Admin

1. Créer un compte normal sur https://gasytrip.vercel.app/register
2. Se connecter à la base Railway via terminal :

```bash
mysql -h ballast.proxy.rlwy.net -u root -pTON_MOT_DE_PASSE --port 13570 --protocol=TCP railway
```

3. Promouvoir le compte en ADMIN :

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'ton@email.com';
```

4. Se reconnecter sur le site — le lien "Admin" apparaît dans la Navbar.

---

## Améliorations futures

- Confirmation par email à l'inscription (Nodemailer + SendGrid/Resend)
- Notation des conducteurs après un trajet
- Système de messagerie entre conducteur et passager
- Notifications push pour les réservations
- Paiement en ligne (Orange Money, MVola)
- Application mobile React Native
- PWA (Progressive Web App)

---

## Sécurité

- `.env` dans `.gitignore` — jamais commité
- `JWT_SECRET` long et aléatoire en production
- CORS restreint à l'URL Vercel uniquement
- Transactions MySQL pour les réservations (gestion de la concurrence)
- Contraintes CHECK côté base de données

---

## Auteur
RANDRIAMAHAZAKA Tsilavina
Projet **GasyTrip** — Covoiturage à Madagascar  
*Partagez la route, voyagez ensemble* 🌴
