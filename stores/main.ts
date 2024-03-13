import { defineStore } from "pinia";
import type { Profile } from "@prisma/client";
import { type FullServer } from "@/types/index"

export const useMainStore = defineStore("main", () => {
  const profile = ref<Profile | null>(null);
  const currentServer = ref<FullServer | null>(null);

  function updateProfile(payload: Profile) {
    profile.value = payload;
  }

  function updateServer(payload: FullServer) {
    currentServer.value = payload;
  }

  function onSaveServerChanges(payload: { name: string, imageUrl: string }) {
    if (currentServer.value) {
      currentServer.value.name = payload.name;
      currentServer.value.imageUrl = payload.imageUrl;
    }
  }

  return {
    profile,
    currentServer,
    updateProfile,
    updateServer,
    onSaveServerChanges
  };
});
