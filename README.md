# 🏥 Dossi'Com — Gestion des Urgences Hospitalières

> **Application web complète de gestion et de suivi du parcours patient aux urgences hospitalières.**
> Projet Web INDP2 — SUP'COM — Groupe 6 (Wassim Ben Ameur · Wassim Triki)

**État du projet : Phase 2 (Métier) ✅ · Phase 3 (Auth JWT + RBAC) ✅ · Phase 4 (Frontend ↔ Backend + Temps réel) ✅**
La Phase 5 (tests finaux, variables d'environnement, déploiement) est préparée : voir la section « Déploiement ».

---

## 📌 Présentation du Projet

**Dossi'Com** est une solution numérique conçue pour fluidifier la prise en charge des patients aux urgences hospitalières, depuis l'admission administrative jusqu'à la sortie ou l'hospitalisation.

Le système intègre un contrôle d'accès basé sur les rôles (**RBAC — Role-Based Access Control**) et sécurise les échanges de données médicales sensibles grâce à une authentification stateless par **JSON Web Token (JWT)** et au hachage des mots de passe avec **bcrypt**. La **Phase 4** ajoute la synchronisation temps réel **Socket.io** entre les postes et les fenêtres d'action métier (triage IAO, consultation médicale, gestion des box).

---

## 🏗️ Architecture Globale

```text
dossicom/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── assets/             # Logo officiel Dossi'Com
│   │   ├── components/
│   │   │   ├── common/         # Navbar, ProtectedRoute, Modal réutilisable
│   │   │   ├── patients/       # TriageModal, ConsultationModal   (Phase 4)
│   │   │   ├── lits/           # LitModal (états des box)          (Phase 4)
│   │   │   └── ui/             # PriorityBadge (charte P1–P4)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Session JWT + persistance F5  (Phase 3)
│   │   │   └── SocketContext.jsx   # Temps réel Socket.io          (Phase 4)
│   │   ├── hooks/
│   │   │   └── useApi.js       # Chargement API + temps réel + polling 15 s
│   │   ├── pages/              # 7 espaces + RegisterPage (compte patient)
│   │   ├── services/
│   │   │   └── api.js          # Axios + intercepteur JWT automatique
│   │   └── utils/              # triage.js (suggestion P1–P4), format.js
│   ├── package.json
│   ├── .env.example            # VITE_API_URL / VITE_SOCKET_URL
│   └── vite.config.js          # Proxy Vite API + WebSocket
│
├── server/                     # Backend API REST (Node.js, Express, PostgreSQL)
│   ├── database.sql            # Schéma relationnel complet et idempotent PostgreSQL
│   ├── src/
│   │   ├── config/db.js        # Pool de connexion PostgreSQL (pg)
│   │   ├── controllers/        # auth, patient, lit, stats
│   │   ├── middleware/         # verifyToken (JWT) & checkRole (RBAC)
│   │   ├── models/             # User, Patient, DossierUrgence, Lit (requêtes SQL)
│   │   ├── routes/             # /auth, /patients, /lits, /stats
│   │   ├── socket/socket.js    # Socket.io + émission d'événements (Phase 4)
│   │   └── app.js              # Express + Helmet + CORS + serveur HTTP
│   ├── seed.js                 # Peuplement de la base (comptes, box, patients)
│   ├── .env.example            # Variables d'environnement PostgreSQL & JWT
│   └── package.json
│
└── README.md                   # Ce document