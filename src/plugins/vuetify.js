// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
	theme: {
		defaultTheme: 'light',
		themes: {
			light: {
				dark: false
			},
			dark: {
				dark: true,
				colors: {
					primary: "#800080",
					secondary: "#0341de",
					success: "#035900",
					error: "#820900"
				}
			}
		}
	}
})
