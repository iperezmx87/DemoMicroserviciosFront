// src/plugins/vuetify.ts
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const miTemaBancario = {
  dark: false,
  colors: {
    background: '#F4F6F9',
    surface: '#FFFFFF',
    primary: '#1A237E',   // Azul oscuro institucional
    secondary: '#00B0FF', // Azul brillante para acentos
    error: '#D32F2F',     // Rojo Material para fallos en transferencias o cargos
    success: '#388E3C',   // Verde Material para abonos/transferencias exitosas
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'miTemaBancario',
    themes: {
      miTemaBancario,
    },
  },
});