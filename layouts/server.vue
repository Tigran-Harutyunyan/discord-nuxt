<script setup lang="ts">
import NavigationSidebar from "@/components/navigation/NavigationSidebar.vue";
import { useMainStore } from "@/stores/main";
import type { Profile } from "@prisma/client";
import ServerSidebar from "@/components/server/ServerSidebar.vue";

const { profile } = storeToRefs(useMainStore());

const { updateProfile } = useMainStore();

if (profile.value === null) {
  const response = await $fetch<Profile>("/api/profile");

  if (response?.id) {
    updateProfile(response);
  }
}

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div class="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
    <NavigationSidebar />
  </div>
  <main class="md:pl-[72px] h-full">
    <div class="h-full">
      <div class="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar />
      </div>
      <main class="h-full md:pl-60">
        <slot />
      </main>
    </div>
  </main>
</template>
