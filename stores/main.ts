import { defineStore } from "pinia";
import type { Profile } from "@prisma/client";
import { type FullServer } from "@/types/index"

export const useMainStore = defineStore("main", () => {
  const profile = ref<Profile | null>(null);
  const server = ref<FullServer | null>(null);

  function updateProfile(payload: Profile) {
    profile.value = payload;
  }

  function updateServer(payload: FullServer) {
    server.value = payload;
  }

  return {
    profile,
    server,
    updateProfile,
    updateServer
  };
});
