<script setup lang="ts">
import NavigationSidebar from "@/components/navigation/NavigationSidebar.vue";
import { useMainStore } from "@/stores/main";

const { profile } = storeToRefs(useMainStore());

const { updateProfile } = useMainStore();

if (profile.value === null) {
  const response = await $fetch("/api/profile");

  if (response && typeof response === "object" && "id" in response) {
    updateProfile(response);
  }
}
</script>

<template>
  <!-- <ClientOnly><Setup /></ClientOnly> -->

  <div class="h-full">
    <div class="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
      <NavigationSidebar />
    </div>
    <main class="md:pl-[72px] h-full">
      <NuxtPage />
    </main>
  </div>
</template>
