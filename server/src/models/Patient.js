const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    numeroDossier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "L'âge est requis"],
      min: 0,
      max: 130,
    },
    sexe: {
      type: String,
      enum: ['M', 'F', 'Autre'],
      required: true,
    },
    telephone: {
      type: String,
      trim: true,
      default: '',
    },
    // Statut du parcours patient aux urgences
    statut: {
      type: String,
      enum: [
        'en_attente_triage',       // Phase Accueil : vient d'arriver
        'en_attente_consultation',  // Phase Infirmier : constantes prises, tri P1-P4 fait
        'en_consultation',          // Phase Médecin : consultation en cours
        'sorti',                    // Clôturé : patient libéré / hospitalisé
      ],
      default: 'en_attente_triage',
    },
    dateArrivee: {
      type: Date,
      default: Date.now,
    },
    dateSortie: {
      type: Date,
      default: null,
    },
    // Référence au dossier d'urgence actif
    dossierActif: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DossierUrgence',
      default: null,
    },
    // Lit ou box actuel
    litActuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lit',
      default: null,
    },
    // Compte utilisateur patient associé (pour le portail Patient)
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    enregistrePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
