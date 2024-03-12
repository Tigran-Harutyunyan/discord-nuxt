<script setup lang="ts">
useHead({
  title: "Discord",
});
definePageMeta({
  middleware: "auth",
});
</script>
<template>
  <Setup />
  <div class="h-full p-4 space-y-2">
    <div
      class="flex space-x-2 justify-center items-center h-screen dark:invert"
    >
      <span class="sr-only">Loading...</span>
      <div
        class="h-8 w-8 bg-black :dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"
      ></div>
      <div
        class="h-8 w-8 bg-black :dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s]"
      ></div>
      <div
        class="h-8 w-8 bg-black :dark:bg-white rounded-full animate-bounce"
      ></div>
    </div>
  </div>
</template>
