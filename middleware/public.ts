import { useClerk } from 'vue-clerk';
export default defineNuxtRouteMiddleware(async (to, from) => {
    const nuxtApp = useNuxtApp();

    const clerk = useClerk();

    if (process.server) {
        const auth = nuxtApp.ssrContext?.event.context.auth;
        const userId = auth?.userId;
        if (userId) {
            return navigateTo('/');
        }

    }

    if (process.client && clerk.loaded) {
        if (clerk.user?.id) {
            return navigateTo('/');
        }
    }
});

