/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif']
      },
      colors: {
        ocean: { 50:'#eef7fb', 100:'#d3ebf4', 300:'#7cc1dc', 500:'#1f80a8', 700:'#0b3b5c', 900:'#062436' },
        sand:  { 50:'#fbf6ee', 100:'#f5ead4', 300:'#e8cf99', 500:'#d6a85e' },
        sunset:{ 300:'#ffb37a', 500:'#ff7a3d', 700:'#d8541a' },
        volcano:{ 700:'#2b1d2b', 900:'#141019' }
      },
      boxShadow: {
        card: '0 6px 18px -8px rgba(11,59,92,0.18), 0 2px 6px -2px rgba(11,59,92,0.08)',
        soft: '0 2px 12px -4px rgba(11,59,92,0.10)'
      },
      borderRadius: { '2xl':'1.25rem', '3xl':'1.75rem' },
      animation: {
        'fade-up': 'fadeUp .35s ease-out both',
        'sheet-in': 'sheetIn .28s cubic-bezier(.2,.8,.2,1) both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite'
      },
      keyframes: {
        fadeUp: { '0%':{opacity:0,transform:'translateY(8px)'}, '100%':{opacity:1,transform:'translateY(0)'} },
        sheetIn: { '0%':{transform:'translateY(100%)'}, '100%':{transform:'translateY(0)'} },
        pulseSoft: { '0%,100%':{opacity:1}, '50%':{opacity:.55} }
      }
    }
  },
  plugins: []
};
