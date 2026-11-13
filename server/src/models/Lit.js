const mongoose = require('mongoose');

const litSchema = new mongoose.Schema(
  {
    numeroBox: {
      type: String,
      required: [true, 'Le numéro de box est requis'],
      unique: true,
      trim: true,
    },
    service: {
      type: String,
      default: 'Urgences Générales',
    },
    statut: {
      type: String,
      enum: ['libre', 'occupe', 'nettoyage', 'maintenance'],
      default: 'libre',
    },
    patientAffecte: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    derniereModificationPar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lit', litSchema);
