import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { urgenceService } from '../services/urgenceService';

const FILTRES = ['Tous', 'Nouveaux', 'En attente', 'En consultation'];

export default function AccueilDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [recherche, setRecherche] = useState('');
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [patients, setPatients] = useState([]);
  const [messageConfirmation, setMessageConfirmation] = useState('');
  const [erreurForm, setErreurForm] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // État du formulaire "Nouveau patient"
  const [formPatient, setFormPatient] = useState({
    nom: '',
    prenom: '',
    age: '',
    sexe: 'M',
    telephone: '',
    motifAdmission: '',
  });

  // État du formulaire "Nouveau passage"
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const isNouveauPatientRoute = location.pathname === '/accueil/nouveau-patient';
  const isNouveauPassageRoute = location.pathname === '/accueil/nouveau-passage';
  const isDetailRoute = location.pathname.startsWith('/accueil/patient/');
  const detailPatientId = isDetailRoute
    ? location.pathname.split('/accueil/patient/')[1]
    : null;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await urgenceService.getAccueilData();
        if (isMounted && data?.patients) {
          setPatients(data.patients);
        }
      } catch (err) {
        console.error('Erreur chargement espace accueil :', err);
      }
    };

    loadData();
    window.addEventListener('dossicom:db-updated', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('dossicom:db-updated', loadData);
    };
  }, []);

  const handleCreerPatientSubmit = async (e) => {
    e.preventDefault();
    setErreurForm('');
    setLoadingSubmit(true);

    try {
      const created = await urgenceService.creerPatient(formPatient);
      setFormPatient({
        nom: '',
        prenom: '',
        age: '',
        sexe: 'M',
        telephone: '',
        motifAdmission: '',
      });
      setMessageConfirmation(
        `Patient ${created.prenom} ${created.nom.toUpperCase()} enregistré en base PostgreSQL (${created.numeroDossier}). Transmis au triage.`
      );
      navigate('/accueil');
    } catch (err) {
      setErreurForm(err?.message || 'Erreur lors de la création du patient.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCreerPassageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setErreurForm('Veuillez sélectionner un patient.');
      return;
    }
    setErreurForm('');
    setLoadingSubmit(true);

    try {
      const res = await urgenceService.ouvrirPassage(selectedPatientId);
      setMessageConfirmation(
        `Passage confirmé pour le dossier ${res.dossier} à ${res.heure}.`
      );
      navigate('/accueil');
    } catch (err) {
      setErreurForm(err?.message || 'Erreur lors de l’ouverture du passage.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOuvrirPassage = async (patient) => {
    try {
      const res = await urgenceService.ouvrirPassage(patient.id);
      setMessageConfirmation(
        `Passage ouvert pour ${patient.prenom} ${patient.nom} (${res.dossier}) à ${res.heure}. Transmis au triage infirmier.`
      );
    } catch (err) {
      setMessageConfirmation(
        err?.message || 'Erreur lors de l’ouverture du passage.'
      );
    }
  };

  const patientsFiltres = patients.filter((p) => {
    const correspondRecherche =
      `${p.nom} ${p.prenom} ${p.dossier}`
        .toLowerCase()
        .includes(recherche.toLowerCase());

    if (!correspondRecherche) return false;
    if (filtreActif === 'Tous') return true;
    if (filtreActif === 'Nouveaux') return p.statut === 'Nouveau';
    return p.statut === filtreActif;
  });

  const fileAttente = patients.filter(
    (p) => p.statut === 'En attente' || p.statut === 'Nouveau'
  );

  const badgeStatut = (statut) => {
    if (statut === 'En consultation') {
      return 'bg-[#0E7C86]/15 text-[#0E7C86] border border-[#0E7C86]/30';
    }
    if (statut === 'En attente') {
      return 'bg-[#0B4F9E]/15 text-[#0B4F9E] border border-[#0B4F9E]/30';
    }
    return 'bg-[#EEF3F9] text-[#0B2A5B] border border-[#D5DEEA]';
  };

  // Vue 1 : Formulaire "+ Créer un patient"
  if (isNouveauPatientRoute) {
    return (
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Enregistrement d’un nouveau patient</h1>
            <p className="text-caption mt-1">
              Admission administrative et ouverture immédiate du dossier d’urgence
            </p>
          </div>
          <Link to="/accueil" className="btn-secondary px-4 py-2 text-sm">
            ← Retour
          </Link>
        </div>

        <form onSubmit={handleCreerPatientSubmit} className="dossi-card p-6 space-y-5">
          {erreurForm && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {erreurForm}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formPatient.nom}
                onChange={(e) => setFormPatient({ ...formPatient, nom: e.target.value })}
                placeholder="Ex. Ben Salah"
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formPatient.prenom}
                onChange={(e) => setFormPatient({ ...formPatient, prenom: e.target.value })}
                placeholder="Ex. Amine"
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Âge (ans) *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formPatient.age}
                onChange={(e) => setFormPatient({ ...formPatient, age: e.target.value })}
                placeholder="Ex. 38"
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Sexe *
              </label>
              <select
                value={formPatient.sexe}
                onChange={(e) => setFormPatient({ ...formPatient, sexe: e.target.value })}
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="M">Masculin (M)</option>
                <option value="F">Féminin (F)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formPatient.telephone}
                onChange={(e) => setFormPatient({ ...formPatient, telephone: e.target.value })}
                placeholder="Ex. 22 450 112"
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
                Motif d’admission aux urgences *
              </label>
              <textarea
                rows="3"
                required
                value={formPatient.motifAdmission}
                onChange={(e) =>
                  setFormPatient({ ...formPatient, motifAdmission: e.target.value })
                }
                placeholder="Ex. Douleur abdominale aiguë depuis 2 heures"
                className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/accueil" className="btn-secondary px-4 py-2.5 text-sm">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="btn-primary px-5 py-2.5 text-sm cursor-pointer disabled:opacity-50"
            >
              {loadingSubmit ? 'Enregistrement...' : 'Enregistrer et ouvrir le dossier'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Vue 2 : Formulaire "Créer un passage"
  if (isNouveauPassageRoute) {
    return (
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Ouvrir un passage aux urgences</h1>
            <p className="text-caption mt-1">
              Sélectionner un patient déjà enregistré dans la base
            </p>
          </div>
          <Link to="/accueil" className="btn-secondary px-4 py-2 text-sm">
            ← Retour
          </Link>
        </div>

        <form onSubmit={handleCreerPassageSubmit} className="dossi-card p-6 space-y-4">
          {erreurForm && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {erreurForm}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0B2A5B] mb-1">
              Patient enregistré *
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded-lg border border-[#D5DEEA] px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">— Choisir un patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.dossier} — {p.nom.toUpperCase()} {p.prenom} ({p.age} ans)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/accueil/nouveau-patient"
              className="text-xs font-semibold text-[#0B4F9E] hover:underline"
            >
              Patient absent de la liste ? Créer une fiche →
            </Link>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="btn-primary px-5 py-2.5 text-sm cursor-pointer"
            >
              Confirmer le passage
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Vue 3 : Fiche administrative détaillée "/accueil/patient/:id"
  if (isDetailRoute) {
    const patientDetail = patients.find(
      (p) => String(p.id) === String(detailPatientId)
    );

    return (
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Fiche administrative du patient</h1>
            <p className="text-caption mt-1">
              Données d’identification uniquement (secret médical protégé)
            </p>
          </div>
          <Link to="/accueil" className="btn-secondary px-4 py-2 text-sm">
            ← Retour
          </Link>
        </div>

        {!patientDetail ? (
          <div className="dossi-card p-6 text-sm text-[#5B6675]">
            Dossier patient introuvable.
          </div>
        ) : (
          <div className="dossi-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D5DEEA] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0B2A5B]">
                  {patientDetail.nom.toUpperCase()} {patientDetail.prenom}
                </h2>
                <p className="text-xs font-semibold text-[#0B4F9E]">
                  N° Dossier : {patientDetail.dossier}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold ${badgeStatut(
                  patientDetail.statut
                )}`}
              >
                {patientDetail.statut}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-[#5B6675]">Âge / Sexe</dt>
                <dd className="font-semibold text-slate-900">
                  {patientDetail.age} ans · {patientDetail.sexe}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5B6675]">Téléphone</dt>
                <dd className="font-semibold text-slate-900">
                  {patientDetail.telephone || 'Non renseigné'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5B6675]">Heure d’arrivée</dt>
                <dd className="font-semibold text-slate-900">
                  {patientDetail.arrivee}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5B6675]">Attente estimée</dt>
                <dd className="font-semibold text-slate-900">
                  {patientDetail.attente}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    );
  }

  // Vue principale de l'Espace Accueil
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Espace accueil</h1>
          <p className="text-caption mt-1">
            Recherche, enregistrement administratif et ouverture des passages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/accueil/nouveau-patient"
            className="btn-primary px-4 py-2.5 text-sm"
          >
            + Créer un patient
          </Link>
          <Link
            to="/accueil/nouveau-passage"
            className="btn-secondary px-4 py-2.5 text-sm"
          >
            Créer un passage
          </Link>
        </div>
      </div>

      {messageConfirmation && (
        <div
          role="status"
          className="dossi-card border-l-4 border-l-[#1B7F4B] p-4 flex items-center justify-between gap-4"
        >
          <p className="text-sm font-medium text-[#1B7F4B]">
            {messageConfirmation}
          </p>
          <button
            type="button"
            onClick={() => setMessageConfirmation('')}
            className="text-xs font-semibold text-[#5B6675] hover:text-[#0B2A5B] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      <section className="dossi-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <label htmlFor="recherche-patient" className="sr-only">
              Rechercher un patient par nom, prénom ou numéro de dossier
            </label>
            <input
              id="recherche-patient"
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un patient (nom, prénom ou n° DOS-...) avant création"
              className="w-full rounded-lg border border-[#D5DEEA] bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#0B4F9E] focus:outline-none focus:ring-2 focus:ring-[#0B4F9E]/20"
            />
            <svg
              className="w-4 h-4 text-[#5B6675] absolute left-3.5 top-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTRES.map((filtre) => (
              <button
                key={filtre}
                type="button"
                onClick={() => setFiltreActif(filtre)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  filtreActif === filtre
                    ? 'bg-[#0B2A5B] text-white'
                    : 'bg-[#EEF3F9] text-[#5B6675] hover:text-[#0B2A5B]'
                }`}
              >
                {filtre}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Dossiers numériques des patients ({patientsFiltres.length})</h2>
          <span className="text-caption">Données administratives uniquement</span>
        </div>

        {patientsFiltres.length === 0 ? (
          <div className="dossi-card p-8 text-center space-y-3">
            <p className="text-sm text-[#5B6675]">
              Aucun dossier patient ne correspond à votre recherche.
            </p>
            <Link
              to="/accueil/nouveau-patient"
              className="btn-primary inline-block px-4 py-2 text-sm"
            >
              Créer une nouvelle fiche patient
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {patientsFiltres.map((patient) => (
              <article
                key={patient.id}
                className="dossi-card p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded-full bg-[#0B2A5B] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {patient.prenom?.[0]}
                      {patient.nom?.[0]}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badgeStatut(
                        patient.statut
                      )}`}
                    >
                      {patient.statut}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0B2A5B]">
                      {patient.nom.toUpperCase()} {patient.prenom}
                    </h3>
                    <p className="text-xs font-semibold text-[#0B4F9E] tabular-nums mt-0.5">
                      {patient.dossier} · {patient.age} ans
                    </p>
                    <p className="text-xs text-[#5B6675] tabular-nums mt-1">
                      Arrivée : {patient.arrivee}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5DEEA]">
                  {patient.statut === 'Nouveau' ? (
                    <button
                      type="button"
                      onClick={() => handleOuvrirPassage(patient)}
                      className="btn-primary w-full py-2 px-3 text-xs sm:text-sm cursor-pointer"
                    >
                      Ouvrir un passage
                    </button>
                  ) : (
                    <Link
                      to={`/accueil/patient/${patient.id}`}
                      className="btn-secondary block w-full py-2 px-3 text-xs sm:text-sm text-center"
                    >
                      Voir le dossier
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dossi-card overflow-hidden">
        <div className="p-5 border-b border-[#D5DEEA] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2>File d’attente — lecture seule</h2>
            <p className="text-caption">
              Suivi administratif des arrivées (aucune information clinique affichée)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#EEF3F9] border border-[#D5DEEA] text-xs font-semibold text-[#5B6675] self-start sm:self-auto">
            Lecture seule
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="dossi-table w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Dossier</th>
                <th className="py-3.5 px-5 font-semibold">Patient</th>
                <th className="py-3.5 px-5 font-semibold">Arrivée</th>
                <th className="py-3.5 px-5 font-semibold">Statut</th>
                <th className="py-3.5 px-5 font-semibold">Attente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DEEA] text-sm">
              {fileAttente.map((item) => (
                <tr key={item.id} className="hover:bg-[#EEF3F9]/50">
                  <td className="py-3.5 px-5 font-semibold text-[#0B2A5B] tabular-nums">
                    {item.dossier}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-900">
                    {item.nom.toUpperCase()} {item.prenom}
                  </td>
                  <td className="py-3.5 px-5 text-[#5B6675] tabular-nums">
                    {item.arrivee}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badgeStatut(
                        item.statut
                      )}`}
                    >
                      {item.statut}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#0B2A5B] tabular-nums">
                    {item.attente}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}