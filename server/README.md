# Dossi'Com — Serveur Backend (Phase 3)

## Prérequis
- Node.js >= 18
- MongoDB (local sur le port 27017 ou Atlas)

## Installation
```bash
cd server
npm install
```

## Configuration
Vérifier le fichier `.env` (déjà créé) :
- `MONGO_URI` : URI MongoDB
- `JWT_SECRET` : clé secrète JWT
- `PORT` : port du serveur (5000 par défaut)

## Lancer le serveur
```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

## Peupler la base de données
```bash
npm run seed
```

## Utilisateurs de démo
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| accueil@dossicom.fr | Accueil@123 | accueil |
| infirmier@dossicom.fr | Infirmier@123 | infirmier |
| medecin@dossicom.fr | Medecin@123 | medecin |
| responsable@dossicom.fr | Resp@123 | responsable |
| patient@dossicom.fr | Patient@123 | patient |

## Endpoints API
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | /api/auth/login | Public | Connexion + JWT |
| GET | /api/auth/me | Protégé | Profil utilisateur |
| GET | /api/health | Public | Santé du serveur |
