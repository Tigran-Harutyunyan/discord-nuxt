import { defineStore } from "pinia";
import { type Profile } from "@prisma/client";

export const useMainStore = defineStore("main", () => {
  const profile = ref<Profile | null>(null);

  function updateProfile(payload: Profile) {
    profile.value = payload;
  }

  return {
    profile,
    updateProfile,
  };
});
