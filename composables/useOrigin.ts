export const useOrigin = () => {
    const origin = ref("");

    onMounted(() => {
        origin.value = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    })

    return origin;
}