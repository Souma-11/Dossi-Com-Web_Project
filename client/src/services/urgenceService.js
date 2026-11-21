import { apiRequest, getLocalDB, saveLocalDB } from './api';

function formatHeure(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calcAttenteMin(isoDate) {
  if (!isoDate) return 0;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
}

function mapStatutAccueil(statutSql) {
  if (statutSql === 'en_consultation') return 'En consultation';
  if (statutSql === 'en_attente_triage' || statutSql === 'en_attente_consultation') {
    return 'En attente';
  }
  if (statutSql === 'sorti') return 'Sorti';
  return 'Nouveau';
}

function mapEtapePatient(statutSql) {
  if (statutSql === 'en_attente_triage') return 1;
  if (statutSql === 'en_attente_consultation') return 2;
  if (statutSql === 'en_consultation') return 3;
  if (statutSql === 'sorti') return 4;
  return 0;
}

export const urgenceService = {
  async getPublicStats() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await apiRequest('/patients');
        const actifs = (res.patients || []).filter((p) => p.statut !== 'sorti');
        const enAttente = actifs.filter((p) => p.statut !== 'en_consultation').length;
        const saturation = Math.min(100, Math.round((actifs.length / 8) * 100));
        return {
          saturation,
          medecinsPresents: 4,
          patientsAttente: enAttente,
          attenteMoyenne: enAttente > 0 ? Math.max(12, enAttente * 10) : 10,
        };
      } catch {
        // Fallback si session expirée
      }
    }

    return {
      saturation: 35,
      medecinsPresents: 4,
      patientsAttente: 2,
      attenteMoyenne: 18,
    };
  },

  async getAccueilData() {
    const res = await apiRequest('/patients');
    const patients = (res.patients || []).map((p) => {
      const statut = mapStatutAccueil(p.statut);
      const min = calcAttenteMin(p.dateArrivee);
      return {
        id: p.id,
        dossier: p.numeroDossier,
        nom: p.nom,
        prenom: p.prenom,
        age: p.age ?? 0,
        sexe: p.sexe || 'M',
        telephone: p.telephone || '',
        motifAdmission: p.dossierActif?.motifAdmission || '',
        priorite: p.dossierActif?.priorite || null,
        statut,
        statutSql: p.statut,
        arrivee: formatHeure(p.dateArrivee),
        attente: statut === 'En attente' ? `${min} min` : '—',
      };
    });

    return { patients };
  },

  async creerPatient({ nom, prenom, age, dateNaissance, sexe, telephone, motifAdmission }) {
    let computedAge = Number(age);
    if (Number.isNaN(computedAge) || computedAge <= 0) {
      const birthYear = dateNaissance
        ? new Date(dateNaissance).getFullYear()
        : 1990;
      computedAge = Math.max(0, new Date().getFullYear() - birthYear);
    }

    const res = await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify({
        nom: nom.trim(),
        prenom: prenom.trim(),
        age: computedAge,
        sexe: sexe || 'M',
        telephone: telephone?.trim() || '',
        motifAdmission: motifAdmission?.trim() || 'Admission enregistrée à l’accueil',
      }),
    });

    window.dispatchEvent(new Event('dossicom:db-updated'));
    return res.patient;
  },

  async ouvrirPassage(patientId) {
    const res = await apiRequest(`/patients/${patientId}`);
    const p = res.patient;
    window.dispatchEvent(new Event('dossicom:db-updated'));
    return {
      dossier: p.numeroDossier,
      heure: formatHeure(p.dateArrivee),
    };
  },

  async getInfirmierData() {
    const res = await apiRequest('/patients');
    const list = res.patients || [];

    const aTrier = list
      .filter((p) => p.statut === 'en_attente_triage')
      .map((p) => ({
        id: p.id,
        dossier: p.numeroDossier,
        patient: `${p.nom.toUpperCase()} ${p.prenom}`,
        arrivee: formatHeure(p.dateArrivee),
        attenteMin: calcAttenteMin(p.dateArrivee),
        motifInitial: p.dossierActif?.motifAdmission || 'Admission urgences',
      }));

    const alertes = list
      .filter((p) => p.dossierActif?.alerteAggravation?.active)
      .map((p) => ({
        id: p.id,
        patientId: p.id,
        type: 'Aggravation',
        origine: 'Signalée par le patient',
        dossier: p.numeroDossier,
        patient: `${p.nom.toUpperCase()} ${p.prenom}`,
        ilYa: p.dossierActif?.alerteAggravation?.dateSignalement
          ? `${calcAttenteMin(p.dossierActif.alerteAggravation.dateSignalement)} min`
          : 'À l’instant',
        prioriteActuelle: p.dossierActif?.priorite || 'P3',
      }));

    const historique = {};
    list.forEach((p) => {
      if (p.dossierActif?.priorite) {
        historique[p.numeroDossier] = [
          {
            heure: formatHeure(p.dossierActif.dateTriage || p.dateArrivee),
            niveau: p.dossierActif.priorite,
            motif: p.dossierActif.observationsTriage || p.dossierActif.motifAdmission,
            auteur: p.dossierActif.triageEffectuePar?.name || 'Infirmier IAO',
          },
        ];
      }
    });

    const patientsEnAttente = list.filter((p) => p.statut !== 'sorti').length;

    return { aTrier, alertes, historique, patientsEnAttente };
  },

  async enregistrerTriage({
    dossierId,
    patientId,
    priorite,
    observations,
    motifChangement,
    estReevaluation,
    alerteId,
    constantesVitales,
  }) {
    let targetId = patientId || alerteId || dossierId;

    if (typeof targetId === 'string' && targetId.startsWith('DOS-')) {
      const res = await apiRequest('/patients');
      const found = (res.patients || []).find((p) => p.numeroDossier === targetId);
      if (found) targetId = found.id;
    }

    await apiRequest(`/patients/${targetId}/triage`, {
      method: 'PATCH',
      body: JSON.stringify({
        priorite,
        observationsTriage: estReevaluation
          ? `Réévaluation : ${motifChangement || observations || ''}`
          : observations || '',
        constantesVitales: constantesVitales || {},
      }),
    });

    if (estReevaluation) {
      await apiRequest(`/patients/${targetId}/aggravation`, {
        method: 'PATCH',
      }).catch(() => {});
    }

    window.dispatchEvent(new Event('dossicom:db-updated'));
    return { dossierId: targetId, priorite };
  },

  async getMedecinData() {
    const res = await apiRequest('/patients');
    return (res.patients || [])
      .filter((p) => ['en_attente_consultation', 'en_consultation'].includes(p.statut))
      .map((p) => ({
        id: p.id,
        numeroDossier: p.numeroDossier,
        patient: `${p.nom.toUpperCase()} ${p.prenom}`,
        age: p.age ?? 0,
        salle: p.litActuel?.numeroBox || 'Box disponible',
        priorite: p.dossierActif?.priorite || 'P3',
        arrivee: formatHeure(p.dateArrivee),
        motifTriage: `${p.dossierActif?.motifAdmission || ''}${
          p.dossierActif?.observationsTriage ? ` — ${p.dossierActif.observationsTriage}` : ''
        }`,
        observations: p.dossierActif?.compteRendu
          ? [
              {
                heure: formatHeure(p.dossierActif.dateConsultation || p.dateArrivee),
                texte: p.dossierActif.compteRendu,
              },
            ]
          : [],
        examens: (p.dossierActif?.prescriptions || []).map((lib, index) => ({
          id: `EX-${index + 1}`,
          libelle: lib,
          statut: 'Prescrit',
          resultat: 'En cours',
        })),
        historiquePassages: [],
      }));
  },

  async ajouterObservationMedecin(patientId, texte) {
    await apiRequest(`/patients/${patientId}/consultation`, {
      method: 'PATCH',
      body: JSON.stringify({
        compteRendu: texte,
        terminerConsultation: false,
      }),
    });
    window.dispatchEvent(new Event('dossicom:db-updated'));
  },

  async prescrireExamen(patientId, libelle) {
    const current = await apiRequest(`/patients/${patientId}`);
    const existing = current.patient?.dossierActif?.prescriptions || [];
    await apiRequest(`/patients/${patientId}/consultation`, {
      method: 'PATCH',
      body: JSON.stringify({
        prescriptions: [...existing, libelle],
        terminerConsultation: false,
      }),
    });
    window.dispatchEvent(new Event('dossicom:db-updated'));
  },

  async demanderReevaluationMedecin(patientId, motif) {
    await apiRequest(`/patients/${patientId}/consultation`, {
      method: 'PATCH',
      body: JSON.stringify({
        compteRendu: `Demande de réévaluation infirmière : ${motif}`,
        terminerConsultation: false,
      }),
    });
    window.dispatchEvent(new Event('dossicom:db-updated'));
  },

  async cloturerDossier(patientId, issueCloture, consignesSortie) {
    const orientation =
      issueCloture?.toLowerCase().includes('hospital')
        ? 'hospitalisation'
        : 'retour_domicile';

    await apiRequest(`/patients/${patientId}/consultation`, {
      method: 'PATCH',
      body: JSON.stringify({
        diagnostic: issueCloture || 'Sortie validée',
        compteRendu: consignesSortie?.trim() || issueCloture || 'Sortie des urgences',
        orientationSortie: orientation,
        terminerConsultation: true,
      }),
    });
    window.dispatchEvent(new Event('dossicom:db-updated'));
  },

  async getPatientDashboardData() {
    const res = await apiRequest('/patients');
    const db = getLocalDB();
    const actif =
      (res.patients || []).find((p) => p.statut !== 'sorti') ||
      (res.patients || [])[0];

    if (!actif) {
      return {
        passage: {
          patientId: null,
          numeroSuivi: 'Aucun dossier actif',
          etapeIndex: 0,
          positionFile: 0,
          attenteEstimee: '—',
          priorite: '—',
          salle: 'Accueil',
          medecin: '—',
          consignes: ['Présentez-vous à l’accueil pour ouvrir un passage.'],
        },
        reclamations: db.reclamations || [],
      };
    }

    const position = res.filePosition || 1;
    return {
      passage: {
        patientId: actif.id,
        numeroSuivi: actif.numeroDossier,
        etapeIndex: mapEtapePatient(actif.statut),
        positionFile: position,
        attenteEstimee: actif.statut === 'sorti' ? 'Terminé' : `${position * 15} min`,
        priorite: actif.dossierActif?.priorite || 'En cours de triage',
        salle: actif.litActuel?.numeroBox || 'Salle d’attente principale',
        medecin:
          actif.dossierActif?.medecinResponsable?.name ||
          'Équipe médicale de garde',
        consignes: actif.dossierActif?.compteRendu
          ? [actif.dossierActif.compteRendu]
          : [
              'Restez en salle d’attente principale afin d’entendre votre appel.',
              'Signalez immédiatement toute aggravation de vos symptômes.',
            ],
      },
      reclamations: db.reclamations || [],
    };
  },

  async signalerAggravation(patientIdOrDossier) {
    let targetId = patientIdOrDossier;
    if (!targetId || String(targetId).startsWith('DOS-')) {
      const res = await apiRequest('/patients');
      const actif =
        (res.patients || []).find((p) => p.statut !== 'sorti') ||
        (res.patients || [])[0];
      targetId = actif?.id;
    }

    if (!targetId) {
      throw new Error('Aucun dossier patient actif trouvé.');
    }

    await apiRequest(`/patients/${targetId}/aggravation`, {
      method: 'POST',
    });
    window.dispatchEvent(new Event('dossicom:db-updated'));
  },

  async envoyerAvisOuReclamation({ type, message }) {
    const db = getLocalDB();
    const nextId = String((db.reclamations?.length || 0) + 1).padStart(2, '0');
    const libelleType = type === 'avis' ? 'Avis' : 'Réclamation';

    db.reclamations = [
      {
        id: nextId,
        type: libelleType,
        objet: message.slice(0, 36) + (message.length > 36 ? '…' : ''),
        statut: 'Nouveau',
        message,
        reponse: 'En attente de lecture par le responsable.',
      },
      ...(db.reclamations || []),
    ];
    saveLocalDB(db);
    return db.reclamations;
  },

  async getResponsableData() {
    const resPatients = await apiRequest('/patients');
    // On récupère les lits depuis PostgreSQL
    const resLits = await apiRequest('/lits').catch(() => ({ data: [] }));
    const db = getLocalDB(); 
    
    const list = resPatients.patients || [];
    
    // Formatage des lits pour l'affichage front
    const salles = (resLits.data || []).map(lit => ({
      id: lit.id,
      nom: lit.codeBox,
      zone: lit.zone,
      etat: lit.statut === 'maintenance' ? 'maintenance' : 'operationnelle',
      patientActuel: lit.patientAffecte || null,
      depuis: lit.statut === 'maintenance' ? 'Aujourd’hui' : '—'
    }));

    const journal = list.map((p) => ({
      heure: formatHeure(p.dateSortie || p.dossierActif?.dateTriage || p.dateArrivee),
      utilisateur:
        p.dossierActif?.medecinResponsable?.name ||
        p.dossierActif?.triageEffectuePar?.name ||
        'Accueil',
      evenement: `Dossier ${p.statut.replaceAll('_', ' ')} (${p.dossierActif?.motifAdmission || 'Urgences'})`,
      objet: p.numeroDossier,
      type: p.statut === 'sorti' ? 'cloture' : 'passage',
    }));

    return {
      patientsEnAttente: list.filter((p) => p.statut !== 'sorti').length,
      salles: salles.length > 0 ? salles : db.salles, // Fallback si pas de lits trouvés
      reclamations: db.reclamations || [],
      journal,
    };
  },

  async repondreReclamation(id, texteReponse) {
    const db = getLocalDB();
    const rec = (db.reclamations || []).find((r) => r.id === id);
    if (rec) {
      rec.statut = 'Traité';
      rec.reponse = texteReponse;
      saveLocalDB(db);
    }
  },

  async toggleMaintenanceSalle(salleId) {
    try {
      // Appel PATCH sur la route PostgreSQL pour modifier le statut du lit
      await apiRequest(`/lits/${salleId}/statut`, {
        method: 'PATCH',
        body: JSON.stringify({
          statut: 'maintenance'
        })
      });
      window.dispatchEvent(new Event('dossicom:db-updated'));
    } catch (error) {
      console.error('Erreur bascule maintenance lit :', error);
    }
  },

  async signalerProblemeService({ auteurRole, categorie, salle, urgence, description }) {
    const db = getLocalDB();
    const nextId = String((db.reclamations?.length || 0) + 1).padStart(2, '0');
    const libelleRole = auteurRole === 'medecin' ? 'Médecin' : 'Infirmier';
    const nouveau = {
      id: nextId,
      type: `Signalement (${libelleRole})`,
      objet: `${categorie}${salle ? ` · ${salle}` : ''} [${urgence}]`,
      statut: 'Nouveau',
      message: description.trim(),
      reponse: 'En attente de prise en charge par le responsable.',
    };
    db.reclamations = [nouveau, ...(db.reclamations || [])];
    saveLocalDB(db);
    return nouveau;
  },
};

export default urgenceService;