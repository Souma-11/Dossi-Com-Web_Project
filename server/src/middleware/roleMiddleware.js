/**
 * Middleware RBAC — Contrôle d'accès basé sur les rôles.
 * Vérifie que l'utilisateur connecté possède l'un des rôles requis.
 * Doit impérativement être placé APRÈS verifyToken.
 *
 * Supporte 2 syntaxes :
 * 1. Tableau : checkRole(['infirmier', 'responsable'])   <-- selon la spécification exacte du projet
 * 2. Arguments séparés : checkRole('medecin', 'responsable')
 *
 * @param {string[]|...string} allowedRoles
 */
const checkRole = (...roles) => {
  // Aplatit dans le cas où l'utilisateur passe un tableau : checkRole(['role1', 'role2'])
  const flattenedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Utilisateur non authentifié.',
      });
    }

    if (!flattenedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit. Cette action requiert le rôle [${flattenedRoles.join(', ')}]. Votre rôle actuel est : '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
  requireRole: checkRole, // Alias pour rétrocompatibilité
};
