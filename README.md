# 🏥 Dossi'Com — Gestion des Urgences Hospitalières

Application web complète de gestion et de suivi du parcours patient aux urgences hospitalières.  
**Projet Web INDP2 — SUP'COM — Groupe 6** (*Wassim Ben Ameur · Wassim Triki*)

**État du projet :** Phase 2 (Métier) ✅ · Phase 3 (Auth JWT + RBAC) ✅ · Phase 4 (Frontend ↔ Backend + Temps réel) ✅ · Phase 5 (UI, Accessibilité WCAG AA & Responsive) ✅

---

## 📌 Présentation du Projet

**Dossi'Com** est une solution numérique conçue pour fluidifier la prise en charge des patients aux urgences hospitalières, depuis l'admission administrative jusqu'à la sortie ou l'hospitalisation.

Le système intègre un contrôle d'accès basé sur les rôles (**RBAC — Role-Based Access Control**) et sécurise les échanges de données médicales sensibles grâce à une authentification *stateless* par **JSON Web Token (JWT)** et au hachage des mots de passe avec **bcrypt**. La Phase 4 ajoute la synchronisation temps réel **Socket.io** entre les postes et les fenêtres d'action métier (accueil, triage P1–P4, alertes critiques d'aggravation, consultation médicale, supervision), tandis que la Phase 5 garantit la conformité d'accessibilité **WCAG AA** et l'ergonomie mobile (**375 px**).

---

## 🏗️ Architecture Globale

```text
dossicom/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS)
│   ├── public/                 # Favicon et icône institutionnelle (dossicom-icone-512_2.png)
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
│   │   │   └── demoData.js     # Jeu de données unifié (UR-2026-0001 à UR-2026-0007)
│   │   ├── hooks/
│   │   │   └── useApi.js       # Chargement API + temps réel + polling 15 s
│   │   ├── pages/              # 7 espaces + RegisterPage (compte patient)
│   │   ├── services/
│   │   │   ├── api.js          # Axios + intercepteur JWT automatique
│   │   │   └── socket.js       # Client WebSocket Socket.io partagé
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
│   │   ├── routes/             # /auth, /dossiers, /patients, /lits, /stats
│   │   ├── socket/socket.js    # Socket.io + émission d'événements (Phase 4)
│   │   └── app.js              # Express + Helmet + CORS + serveur HTTP partagé
│   ├── seed.js                 # Peuplement de la base (comptes, box, patients)
│   ├── .env.example            # Variables d'environnement PostgreSQL & JWT
│   └── package.json
│
└── README.md                   # Documentation du projet
```

---

## 🛠️ Choix Techniques & Frameworks

* **Frontend — React 19 & Vite :** Choisi pour son architecture modulaire orientée composants réutilisables (`TriageModal`, `ConsultationModal`, `LitModal`, `PriorityBadge`) et sa gestion d'état réactive via les hooks (`AuthContext`, `SocketContext`, hook personnalisé `useApi`), idéale pour synchroniser plusieurs espaces métier sans rechargement de page. **Vite** offre un serveur de développement instantané, un proxy API/WebSocket intégré et un *bundling* léger en production.
* **Design & Responsivité — Tailwind CSS :** Permet d'appliquer rapidement une identité visuelle médicale cohérente (charte des niveaux de priorité P1 à P4), de respecter les ratios de contraste d'accessibilité **WCAG AA** et d'assurer une adaptation fluide du mobile (**375 px**) au grand écran.
* **Backend & Temps réel — Node.js, Express & Socket.io :** L'utilisation de JavaScript sur l'ensemble de la pile unifie la logique métier et les modèles de données entre client et serveur. **Express** structure l'API REST de manière claire et modulaire, tandis que **Socket.io** répond à l'exigence critique d'un service d'urgences en propageant instantanément les admissions, résultats de triage et alertes d'aggravation sur tous les postes connectés (avec mécanisme de repli par *polling* toutes les 15 secondes).
* **Base de données & Sécurité — PostgreSQL, JWT & bcrypt :** **PostgreSQL** garantit l'intégrité relationnelle entre les utilisateurs, les dossiers d'urgence, les actes médicaux et l'occupation des box. L'authentification *stateless* par **JWT**, le hachage **bcrypt** et les middlewares **Helmet / CORS** sécurisent l'accès aux données médicales selon chaque profil utilisateur (RBAC).

---

## ✨ Fonctionnalités Développées (8 Pages Dynamiques)

1. **Authentification & Inscription (`LoginPage` & `RegisterPage`) :** Connexion sécurisée par rôle avec persistance de session au rechargement (`F5`) et création de compte patient autonome.
2. **Espace Accueil / Secrétariat :** Enregistrement administratif rapide des admissions, création des dossiers d'urgence (`UR-2026-XXXX`) et suivi de la file d'attente.
3. **Espace Infirmier / Triage :** Saisie des constantes vitales, algorithme d'aide à la décision et suggestion automatique du niveau d'urgence **P1 à P4** (`utils/triage.js`), et déclenchement d'alertes critiques d'aggravation en temps réel.
4. **Espace Médecin :** Consultation des dossiers triés par priorité, prise en charge clinique (`ConsultationModal`), saisie du diagnostic et décision d'orientation (sortie, surveillance ou hospitalisation).
5. **Espace Supervision & Gestion des Lits :** Cartographie interactive en temps réel des box de soins (`LitModal` : libre, occupé, nettoyage, maintenance) et indicateurs statistiques du service.
6. **Espace Patient :** Consultation personnalisée de l'état d'avancement de son propre dossier médical, du niveau de priorité attribué et du box affecté.
7. **Écran Public (Salle d'attente) :** Affichage anonymisé et mis à jour en temps réel des numéros de dossiers appelés et de l'affluence du service.
8. **Espace Administration :** Gestion des comptes du personnel hospitalier et attribution des permissions RBAC.

---

## 🔐 Comptes de Démonstration

Le script `server/seed.js` initialise automatiquement des comptes de test pour chaque rôle (`@dossicom.tn`) ainsi qu'un jeu de dossiers patients (`UR-2026-0001` à `UR-2026-0007`) :

| Rôle | Identifiant | Permissions principales |
| :--- | :--- | :--- |
| **Administrateur** | `admin@dossicom.tn` | Supervision globale et gestion des rôles RBAC |
| **Accueil** | `accueil@dossicom.tn` | Création et admission des dossiers patients |
| **Infirmier (IOA)** | `infirmier@dossicom.tn` | Triage P1–P4, constantes et alertes d'aggravation |
| **Médecin** | `medecin@dossicom.tn` | Consultation médicale, diagnostic et clôture/orientation |
| **Superviseur Lits** | `superviseur@dossicom.tn` | Affectation et gestion de l'état des box |
| **Patient** | `patient@dossicom.tn` | Suivi personnel de son parcours aux urgences |

*(Les mots de passe de démonstration sont définis dans `server/seed.js` ; un mode démonstration autonome via `client/src/data/demoData.js` reste également disponible).*

---

## 🚀 Étapes de Lancement du Projet

### Prérequis
* **Node.js** (version 18 ou supérieure) et **npm**
* **PostgreSQL** (version 14 ou supérieure)
* **Git**

### 1. Cloner le dépôt
```bash
git clone https://github.com/Souma-11/Dossi-Com-Web_Project.git
cd Dossi-Com-Web_Project
```

### 2. Initialiser la base de données PostgreSQL
Créez une base de données nommée `dossicom`, puis exécutez le script SQL fourni :
```bash
createdb -U postgres dossicom
psql -U postgres -d dossicom -f server/database.sql
```

### 3. Configurer et démarrer le Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env
```
Renseignez vos identifiants PostgreSQL et votre clé secrète `JWT_SECRET` dans `server/.env`, puis peuplez la base et lancez le serveur :
```bash
node seed.js
npm run dev
```
*Le serveur API REST et Socket.io démarre par défaut sur `http://localhost:5000`.*

### 4. Configurer et démarrer le Frontend (`client/`)
Dans un second terminal :
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
*L'application React est accessible sur `http://localhost:5173`.*

---

## ♿ Qualité, Sécurité & Accessibilité

* **Sécurité :** Validation des jetons JWT (`verifyToken`), contrôle strict des permissions par route (`checkRole`), protection des en-têtes HTTP via `helmet` et requêtes SQL paramétrées contre les injections.
* **Accessibilité & Ergonomie :** Balisage HTML sémantique, navigation clavier complète sur les modales, contrastes conformes au standard **WCAG AA** et interface testée jusqu'à **375 px** de largeur.