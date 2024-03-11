// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@hebilicious/vue-query-nuxt', '@nuxtjs/google-fonts', '@nuxtjs/cloudinary', '@pinia/nuxt', "@nuxt/image", '@vueuse/nuxt', '@vee-validate/nuxt'],
  build: {
    transpile: ['vue-clerk', '@clerk/clerk-js'],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  alias: {
    ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
  },
  runtimeConfig: {
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
      unsplashAccessKey: process.env.NUXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    },
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
  },
  googleFonts: {
    subsets: 'latin',
    families: {
      Poppins: {
        wght: [200, 300, 400, 500, 600, 700, 800, 900],
      },
      Open_Sans: {
        wght: [400, 500, 600],
      }
    }
  },

});
