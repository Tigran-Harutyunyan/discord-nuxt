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
  <div class="h-full p-4 space-y-2"></div>
</template>
