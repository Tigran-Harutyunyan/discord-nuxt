<script setup lang="ts">
import ModalsContainer from "@/components/modals/ModalsContainer.vue";
useHead({
  bodyAttrs: {
    class: "bg-white dark:bg-[#313338]",
  },
});
import Toaster from "@/components/ui/toast/Toaster.vue";
import { useDark } from "@vueuse/core";
const isDark = useDark();
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster />
  <ModalsContainer />
</template>
