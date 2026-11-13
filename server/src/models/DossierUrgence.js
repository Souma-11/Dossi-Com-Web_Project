const mongoose = require('mongoose');

const dossierUrgenceSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    motifAdmission: {
      type: String,
      required: [true, "Le motif d'admission est requis"],
      trim: true,
    },
    // Constantes vitales saisies par l'infirmier IAO
    constantesVitales: {
      tension: { type: String, default: '' },              // ex: "125/80"
      temperature: { type: Number, default: null },        // °C, ex: 38.2
      frequenceCardiaque: { type: Number, default: null }, // bpm
      spO2: { type: Number, default: null },               // %, ex: 97
      frequenceRespiratoire: { type: Number, default: null },
      douleur: { type: Number, min: 0, max: 10, default: 0 }, // EVA 0-10
      glycemie: { type: Number, default: null },           // g/L
    },
    // Priorité de tri IAO
    priorite: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4', null],
      default: null,
    },
    observationsTriage: {
      type: String,
      default: '',
    },
    // Alerte "Mon état s'aggrave" signalée par le patient (Phase 4)
    alerteAggravation: {
      active: { type: Boolean, default: false },
      dateSignalement: { type: Date, default: null },
      dateTraitement: { type: Date, default: null },
      traiteePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    triageEffectuePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dateTriage: {
      type: Date,
      default: null,
    },
    // Prise en charge médicale par le médecin
    diagnostic: {
      type: String,
      default: '',
    },
    prescriptions: {
      type: [String],
      default: [],
    },
    compteRendu: {
      type: String,
      default: '',
    },
    orientationSortie: {
      type: String,
      enum: ['retour_domicile', 'hospitalisation', 'mutation', 'deces', 'en_cours'],
      default: 'en_cours',
    },
    medecinResponsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dateConsultation: {
      type: Date,
      default: null,
    },
    dateCloture: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DossierUrgence', dossierUrgenceSchema);
