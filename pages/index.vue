<script setup lang="ts">
import Loading from "~/components/Loading.vue";

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
    <Loading />
  </div>
</template>
