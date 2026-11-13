import { useEffect, useState } from 'react';
import { Clock, Info, Activity, AlertTriangle, MapPin, Stethoscope, BedDouble, CheckCircle2 } from 'lucide-react';
import api, { translateError } from '../services/api';
import useApi from '../hooks/useApi';
import PriorityBadge from '../components/ui/PriorityBadge';
import { PRIORITE_SIMPLE, ORIENTATIONS, minutesEnTexte, dateHeureFr, dureeDepuis } from '../utils/format';

/**
 * Espace Patient — Lecture seule (Phase 4).
 * - Suivi du passage RÉEL du patient connecté (GET /api/patients filtré par rôle)
 * - Étapes du parcours : Enregistré → Triage → En attente → Consultation → Orientation
 * - Position dans la file + attente estimée (indicatives, calculées par le serveur)
 * - Bouton "Mon état s'aggrave" : alerte instantanée chez l'Infirmier (Socket.io)
 */
export default function PatientDashboard() {
  // Le backend ne renvoie que le dossier du patient connecté (RBAC)
  const { data, loading, error, refresh } = useApi('/patients', { pollMs: 15000 });
  const [detail, setDetail] = useState(null);
  const [alerteEnCours, setAlerteEnCours] = useState(false);
  const [messageAlerte, setMessageAlerte] = useState('');
  const [erreurAlerte, setErreurAlerte] = useState('');

  const patient = data?.patients?.[0] || null;
  const filePosition = data?.filePosition ?? null;
  const fileTotal = data?.fileTotal ?? null;

  // Dossier détaillé (constantes, médecin, box) une fois le patient connu
  useEffect(() => {
    if (!patient?._id) return;
    let cancelled = false;
    api
      .get(`/patients/${patient._id}`)
      .then(({ data: res }) => {
        if (!cancelled) setDetail(res.patient);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [patient?._id, patient?.statut]);

  const dossier = detail?.dossierActif || patient?.dossierActif;
  const lit = detail?.litActuel || patient?.litActuel;

  // Étapes du parcours communicables
  const etapes = [
    { code: 'enregistre', label: 'Enregistré', atteinte: true },
    { code: 'triage', label: 'Triage', atteinte: !!dossier?.priorite },
    { code: 'attente', label: 'En attente', atteinte: ['en_attente_consultation', 'en_consultation'].includes(patient?.statut) },
    { code: 'consultation', label: 'Consultation', atteinte: ['en_consultation', 'sorti'].includes(patient?.statut) },
    { code: 'orientation', label: 'Orientation', atteinte: patient?.statut === 'sorti' },
  ];
  const etapeActuelleIndex = etapes.reduce(
    (last, e, i) => (e.atteinte ? i : last),
    0
  );

  // Estimation d'attente indicative : position dans la file × ~20 min
  const attenteEstimee =
    filePosition !== null && ['en_attente_triage', 'en_attente_consultation'].includes(patient?.statut)
      ? (filePosition - 1) * 20 + 15
      : null;

  /** Bouton "Mon état s'aggrave" — 1 clic + confirmation, alerte temps réel */
  const signalerAggravation = async () => {
    if (!window.confirm('Confirmer que votre état s\'aggrave ? L\'équipe soignante sera alertée immédiatement.')) {
      return;
    }
    setAlerteEnCours(true);
    setErreurAlerte('');
    try {
      const res = await api.post(`/patients/${patient._id}/aggravation`);
      setMessageAlerte(res.data.message);
      refresh(true);
    } catch (err) {
      setErreurAlerte(translateError(err, 'Erreur lors du signalement.'));
    } finally {
      setAlerteEnCours(false);
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-brand-slate py-10">Chargement de votre passage…</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  // Aucun passage actif (ex : compte créé mais pas encore enregistré à l'accueil)
  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-3">
        <Info size={32} className="mx-auto text-brand-blue" />
        <h1 className="font-title text-2xl text-brand-navy">Aucun passage en cours</h1>
        <p className="text-sm text-brand-slate">
          Votre compte patient est actif, mais aucun passage aux urgences n'est associé pour le moment.
          Passez par l'agent d'accueil du service pour ouvrir un dossier de passage.
        </p>
      </div>
    );
  }

  const alerteActive = dossier?.alerteAggravation?.active;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Bouton toujours visible — 1 clic (charte espace patient) */}
      <div className="sticky top-2 z-10">
        <button
          onClick={signalerAggravation}
          disabled={alerteEnCours || alerteActive || patient.statut === 'sorti'}
          className="w-full bg-priority-p1 hover:bg-red-800 disabled:opacity-70 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <AlertTriangle size={20} />
          {alerteActive
            ? 'Alerte transmise — une équipe arrive'
            : alerteEnCours
              ? 'Envoi de l\'alerte…'
              : 'Mon état s\'aggrave'}
        </button>
      </div>

      {messageAlerte && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-3 rounded-lg">
          {messageAlerte}
        </div>
      )}
      {erreurAlerte && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {erreurAlerte}
        </div>
      )}

      {/* En-tête de bienvenue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <h1 className="font-title text-2xl text-brand-navy mb-2">
          Bonjour {patient.prenom} {patient.nom}
        </h1>
        <p className="text-brand-slate text-sm">
          Bienvenue dans votre espace personnel Dossi'Com. Suivez ici l'avancée de votre prise en
          charge. Dossier n° <b className="text-brand-navy">{patient.numeroDossier}</b>.
        </p>
      </div>

      {/* Étapes du passage */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-brand-navy mb-4">Étapes de votre passage</h2>
        <div className="flex items-start justify-between">
          {etapes.map((etape, i) => (
            <div key={etape.code} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div
                  className={`absolute top-3.5 left-[-50%] w-full h-0.5 ${
                    etapes[i].atteinte ? 'bg-brand-turquoise' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div
                className={`relative z-10 flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                  etape.atteinte
                    ? 'bg-brand-turquoise text-white'
                    : i === etapeActuelleIndex + 1
                      ? 'bg-white border-2 border-brand-turquoise text-brand-darkTurquoise animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {etape.atteinte ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <p
                className={`mt-2 text-xs font-semibold text-center ${
                  etape.atteinte ? 'text-brand-darkTurquoise' : 'text-gray-400'
                }`}
              >
                {etape.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Statut actuel + priorité simplifiée */}
      <div className="bg-brand-navy text-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity size={32} className="text-brand-turquoise" />
          <div>
            <p className="text-sm text-blue-200">Statut actuel</p>
            <p className="text-xl font-bold">
              {patient.statut === 'sorti'
                ? `Passage terminé — ${ORIENTATIONS[dossier?.orientationSortie] || 'sortie'}`
                : dossier?.priorite
                  ? PRIORITE_SIMPLE[dossier.priorite]
                  : 'En attente de tri par l\'équipe soignante'}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              Arrivé(e) le {dateHeureFr(patient.dateArrivee)} · il y a {dureeDepuis(patient.dateArrivee)}
            </p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-3 rounded-lg text-center flex flex-col items-center">
          <p className="text-xs text-blue-200 mb-2">Niveau d'urgence évalué par l'infirmier</p>
          {dossier?.priorite ? (
            <PriorityBadge level={dossier.priorite} />
          ) : (
            <span className="text-sm text-blue-100">Triage en cours…</span>
          )}
        </div>
      </div>

      {/* Informations d'attente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
          <Clock className="text-brand-blue shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-brand-navy">Temps d'attente estimé</h3>
            <p className="text-3xl font-bold text-brand-darkTurquoise mt-2">
              {patient.statut === 'sorti'
                ? '—'
                : attenteEstimee !== null
                  ? minutesEnTexte(attenteEstimee)
                  : dossier?.priorite
                    ? 'En cours d\'évaluation'
                    : 'Avant triage'}
            </p>
            {filePosition !== null && patient.statut !== 'sorti' && (
              <p className="text-sm text-brand-slate mt-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-blue" />
                Votre position : <b className="text-brand-navy">{filePosition}</b> sur {fileTotal} patients en attente
              </p>
            )}
            <p className="text-xs text-brand-slate mt-3 leading-relaxed">
              Ce temps est une estimation indicative et peut varier en fonction de l'arrivée d'urgences
              vitales (P1/P2) qui sont prioritaires.
            </p>
          </div>
        </div>

        {/* Salle et médecin une fois l'affectation faite */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
          <BedDouble className="text-brand-turquoise shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-brand-navy">Votre prise en charge</h3>
            <p className="text-sm text-brand-navy mt-2">
              <span className="font-semibold">Salle / Box :</span>{' '}
              {lit?.numeroBox || <span className="text-brand-slate">attribuée dès qu'un box sera libre</span>}
            </p>
            <p className="text-sm text-brand-navy mt-1 flex items-center gap-1.5">
              <Stethoscope size={14} className="text-brand-blue" />
              <span>
                <span className="font-semibold">Médecin :</span>{' '}
                {dossier?.medecinResponsable?.name || (
                  <span className="text-brand-slate">désigné après l'affectation</span>
                )}
              </span>
            </p>
            {lit?.numeroBox && (
              <p className="text-xs text-brand-slate mt-2">
                Installez-vous ou attendez dans la salle d'attente proche du box — un soignant vous appellera.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Consignes */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex items-start gap-4">
        <Info className="text-brand-blue shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-bold text-brand-navy">Consignes importantes</h3>
          <ul className="text-sm text-brand-navy mt-3 space-y-2 list-disc list-inside">
            <li>Merci de rester en salle d'attente.</li>
            <li>Gardez vos documents d'identité à portée de main.</li>
            <li>
              Si vos symptômes s'aggravent, utilisez le bouton rouge « Mon état s'aggrave » — il ne
              remplace pas un appel direct à un soignant.
            </li>
            <li>En cas d'urgence vitale, appelez le 190.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
