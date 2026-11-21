# 🏥 Dossi'Com — Gestion des Urgences Hospitalières

Application web complète de gestion et de suivi du parcours patient aux urgences hospitalières.  
**Projet Web INDP2 — SUP'COM — Groupe 6** (*Wassim Ben Ameur · Wassim Triki*)

**État du projet :** Phase 2 (Métier) ✅ · Phase 3 (Auth JWT + RBAC) ✅ · Phase 4 (Frontend ↔ Backend + Temps réel) ✅ · Phase 5 (UI, Accessibilité WCAG AA, Responsive & Performance) ✅

---

## 📌 Présentation du Projet

**Dossi'Com** est une solution numérique conçue pour fluidifier la prise en charge des patients aux urgences hospitalières, depuis l'admission administrative jusqu'à la sortie ou l'hospitalisation.

Le système intègre un contrôle d'accès basé sur les rôles (**RBAC — Role-Based Access Control**) et sécurise les échanges de données médicales sensibles grâce à une authentification *stateless* par **JSON Web Token (JWT)** et au hachage des mots de passe avec **bcrypt**. La Phase 4 ajoute la synchronisation temps réel **Socket.io** entre les postes et les fenêtres d'action métier (accueil, triage P1–P4, alertes critiques d'aggravation, consultation médicale, supervision), tandis que la Phase 5 garantit la conformité d'accessibilité **WCAG AA**, l'ergonomie mobile (**375 px**) et l'optimisation des performances (*Code Splitting* `React.lazy`).

---

## 🚀 Installation et lancement en local

### Prérequis
* **Node.js** ≥ 18
* **PostgreSQL** installé et démarré (port `5432` par défaut)

### 1. Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env     # puis adapter DB_USER / DB_PASSWORD / JWT_SECRET
node setupDb.js          # crée la base « dossicom », les tables et les box
npm run seed             # crée les comptes de démonstration et un patient test
npm run dev              # démarre l'API sur http://localhost:5000
```

### 2. Frontend (`client/`)
Dans un second terminal :
```bash
cd client
npm install
cp .env.example .env     # les valeurs par défaut conviennent en local
npm run dev              # ouvre l'application sur http://localhost:5173
```

### Comptes de démonstration
Après `npm run seed`, tous les comptes ont le même mot de passe : **`Dossicom2026!`**

| Rôle | Email |
| :--- | :--- |
| **Accueil** | `accueil@dossicom.tn` |
| **Infirmier** | `infirmier@dossicom.tn` |
| **Médecin** | `medecin@dossicom.tn` |
| **Responsable** | `responsable@dossicom.tn` |
| **Patient** | `patient@dossicom.tn` |

### Commandes utiles (`client`)

| Commande | Rôle |
| :--- | :--- |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production (dossier `dist/`) |
| `npm run preview` | Prévisualiser le build (utile pour Lighthouse) |
| `npm run lint` | Vérification ESLint |

---

## 🔌 Endpoints API principaux

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Santé du serveur |
| `POST` | `/api/auth/register` | Public | Création d'un compte patient |
| `POST` | `/api/auth/login` | Public | Connexion + JWT |
| `GET` | `/api/auth/me` | Authentifié | Profil de l'utilisateur |
| `GET` | `/api/stats/public` | Public | Statistiques du tableau de bord public |
| `POST` | `/api/patients` | Accueil, responsable | Enregistrement d'un patient |
| `GET` | `/api/patients` | Authentifié | File d'attente (filtrée selon le rôle) |
| `GET` | `/api/patients/:id` | Authentifié | Dossier d'un patient |
| `PATCH` | `/api/patients/:id/triage` | Infirmier, responsable | Triage P1–P4 et constantes |
| `PATCH` | `/api/patients/:id/consultation` | Médecin, responsable | Diagnostic et clôture |
| `POST` | `/api/patients/:id/aggravation` | Patient | Signalement « Mon état s'aggrave » |
| `GET` | `/api/lits` | Personnel | Liste des box |
| `PATCH` | `/api/lits/:id` | Responsable | Mise à jour de l'état d'un box |

---

## 🏗️ Architecture Globale

```text
Dossi’Com/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS)
│   ├── public/
│   │   ├── images/             # Visuels des espaces métiers (accueil, infirmier, médecin, responsable, patient)
│   │   └── ...                 # Favicon et icône institutionnelle
│   ├── src/
│   │   ├── assets/             # Logo officiel Dossi'Com
│   │   ├── components/
│   │   │   ├── common/         # Navbar (menu burger mobile), Footer, ProtectedRoute, Toast, Modal
│   │   │   ├── patients/       # TriageModal, ConsultationModal   (Phase 4)
│   │   │   ├── lits/           # LitModal (états des box)          (Phase 4)
│   │   │   └── ui/             # PriorityBadge (charte P1–P4)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Session JWT + persistance F5  (Phase 3)
│   │   │   └── SocketContext.jsx   # Temps réel Socket.io          (Phase 4)
│   │   ├── data/
│   │   │   └── mockData.js     # Jeu de données de repli et démonstration (UR-2026-0001 à UR-2026-0007)
│   │   ├── hooks/
│   │   │   ├── useApi.js           # Chargement API + temps réel + polling 15 s
│   │   │   └── useDossiComSync.js  # Synchronisation globale temps réel (stats publiques & alertes)
│   │   ├── pages/              # 7 espaces + RegisterPage (chargés dynamiquement via React.lazy)
│   │   ├── services/
│   │   │   ├── api.js              # Requêtes HTTP + jeton JWT automatique
│   │   │   ├── authService.js      # Gestion des sessions et rôles utilisateurs
│   │   │   └── urgenceService.js   # Requêtes métier urgences (stats publiques, file clinique)
│   │   ├── utils/              # triage.js (suggestion P1–P4), format.js
│   │   └── App.jsx             # Routage RBAC + React.lazy / Suspense
│   ├── package.json
│   ├── .env.example            # VITE_API_URL / VITE_SOCKET_URL
│   └── vite.config.js          # Proxy Vite API + WebSocket
│
├── server/                     # Backend API REST (Node.js, Express, PostgreSQL)
│   ├── config/
│   │   └── db.js               # Pool de connexion PostgreSQL (pg)
│   ├── database.sql            # Schéma relationnel complet et idempotent PostgreSQL
│   ├── setupDb.js              # Initialisation automatisée de la base PostgreSQL
│   ├── seed.js                 # Peuplement de la base (comptes, box, patients)
│   ├── src/
│   │   ├── controllers/        # auth, patient, lit, stats
│   │   ├── middleware/         # verifyToken (JWT) & checkRole (RBAC)
│   │   ├── models/             # User, Patient, DossierUrgence, Lit (requêtes SQL)
│   │   ├── routes/             # /auth, /patients, /lits, /stats
│   │   ├── socket/socket.js    # Socket.io + émission d'événements (Phase 4)
│   │   └── app.js              # Express + Helmet + CORS + serveur HTTP partagé
│   ├── .env.example            # Variables d'environnement PostgreSQL & JWT
│   └── package.json
│
└── README.md                   # Documentation du projet
```

---

## ✅ Qualité et performance (Objectif 4)

* **Code splitting :** les 5 espaces métiers sont chargés à la demande (`React.lazy` + `Suspense`), en chunks de 9 à 16 ko.
* **Build Vite :** bundle principal de 359 ko (110 ko compressé).
* **ESLint :** `npm run lint` sans erreur ni avertissement.
* **Responsive :** menu burger sur mobile et tablette, mise en page adaptée jusqu'à 375 px.
* **Accessibilité :** attributs ARIA, rôles `alert` / `status` / `dialog`, priorités P1–P4 toujours accompagnées d'un libellé.