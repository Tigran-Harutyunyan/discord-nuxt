<script setup lang="ts">
import { useDark } from "@vueuse/core";
const isDark = useDark();
useHead({
  bodyAttrs: {
    class: "bg-secondary",
  },
});
</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <slot />
  </div>
</template>
