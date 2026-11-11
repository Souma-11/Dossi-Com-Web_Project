import { useState } from 'react';
import { UserPlus, FileText, CheckCircle } from 'lucide-react';

export default function AccueilDashboard() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    motif: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation de l'envoi des données (plus tard, ça ira vers notre backend)
    console.log("Nouveau dossier patient :", formData);
    setIsSubmitted(true);
    
    // Réinitialisation du formulaire après 3 secondes
    setTimeout(() => {
      setFormData({ nom: '', prenom: '', dateNaissance: '', motif: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-title text-2xl text-brand-navy flex items-center gap-2">
          <UserPlus className="text-brand-turquoise" />
          Espace Accueil - Admission Patient
        </h1>
        <p className="text-brand-slate text-sm mt-1">
          Création du dossier administratif à l'arrivée aux urgences.
        </p>
      </div>

      {/* Formulaire d'admission */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl">
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-bold">Dossier créé avec succès !</p>
              <p className="text-sm">Le patient est maintenant dans la file d'attente de l'infirmier de tri (IAO).</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-1">Nom</label>
                <input 
                  type="text" 
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-blue"
                  placeholder="Ex: Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-1">Prénom</label>
                <input 
                  type="text" 
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-blue"
                  placeholder="Ex: Jean"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Date de naissance</label>
              <input 
                type="date" 
                required
                value={formData.dateNaissance}
                onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-navy mb-1">Motif principal (déclaré par le patient)</label>
              <textarea 
                required
                value={formData.motif}
                onChange={(e) => setFormData({...formData, motif: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-brand-blue h-24"
                placeholder="Ex: Douleur thoracique depuis 2 heures..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-navy text-white font-bold py-2.5 rounded transition"
            >
              <FileText size={18} />
              Enregistrer le dossier
            </button>
          </form>
        )}
      </div>
    </div>
  );
}