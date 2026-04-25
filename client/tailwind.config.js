/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amber: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        tonha: {
          cream:   '#FDF6EC',  // fundo geral
          amber:   '#F5D98C',  // amarelo-bandeirola pastel
          terra:   '#E8A882',  // terracota suave
          sky:     '#A8C8E8',  // azul-céu nordestino
          sage:    '#A8C4A0',  // verde-caatinga pastel
          sand:    '#EDD9B8',  // areia
          brown:   '#6B4423',  // texto escuro / acento
          darksky: '#5B8DB5',  // azul mais forte (hover)
          darkterra: '#C47B56',// terracota hover
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
