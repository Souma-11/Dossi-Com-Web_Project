/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B2A5B',          // Titres, en-têtes, boutons principaux
          blue: '#0B4F9E',          // Liens, éléments actifs, P3[cite: 46]
          turquoise: '#1FAFB5',     // Accents, tracés, étapes validées[cite: 46]
          darkTurquoise: '#0E7C86', // Texte et boutons accessibles[cite: 46]
          bg: '#EEF3F9',            // Fond des pages et menus[cite: 46]
          slate: '#5B6675',         // Textes secondaires, P4[cite: 46]
        },
        priority: {
          p1: '#C8102E', // P1 Immédiate (Rouge)[cite: 46]
          p2: '#B85C00', // P2 Très urgente (Orange assombri)[cite: 46]
          p3: '#0B4F9E', // P3 Urgente (Bleu)[cite: 46]
          p4: '#5B6675', // P4 Moins urgente (Gris ardoise)[cite: 46]
        },
        status: {
          valid: '#1B7F4B',       // Libre / validé[cite: 46]
          maintenance: '#3B4A63'  // Maintenance[cite: 46]
        }
      },
      fontFamily: {
        title: ['Oswald', 'sans-serif'],    // Titres de page (H1)
        body: ['Montserrat', 'sans-serif'], // Interface et textes[cite: 47]
      }
    },
  },
  plugins: [],
}