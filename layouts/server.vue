<script setup lang="ts">
import NavigationSidebar from "@/components/navigation/NavigationSidebar.vue";
import { useMainStore } from "@/stores/main";
import type { Server, Member, Profile } from "@prisma/client";
import ServerSidebar from "@/components/server/ServerSidebar.vue";
import { useModalsStore } from "@/stores/modals";

type serverWithMembers = Server & { members?: Member[] };
const { profile } = storeToRefs(useMainStore());

const { updateProfile, updateServer } = useMainStore();

if (profile.value === null) {
  const response = await $fetch<Profile>("/api/profile");

  if (response?.id) {
    updateProfile(response);
  }
}

const { data } = storeToRefs(useModalsStore());

definePageMeta({
  middleware: "auth",
});

const route = useRoute();

const server = ref<serverWithMembers | null>(null);

const response = await $fetch<serverWithMembers | undefined>(
  `/api/server/${route.params.serverId}`
);

if (response?.id) {
  server.value = response;
  updateServer(server.value);
}

watch(
  () => data.value?.server?.members,
  (members) => {
    if (server.value && members && Array.isArray(members)) {
      server.value.members = members;
      updateServer(server.value);
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
    <NavigationSidebar />
  </div>
  <main class="md:pl-[72px] h-full">
    <div class="h-full">
      <div class="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar :serverId="server.id" :server="server" v-if="server" />
      </div>
      <main class="h-full md:pl-60">
        <slot />
      </main>
    </div>
  </main>
</template>
