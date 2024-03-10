<script setup lang="ts">
import { Hash } from "lucide-vue-next";

import MobileToggle from "@/components/MobileToggle.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import SocketIndicator from "@/components/SocketIndicator.vue";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}
const { serverId, name, type, imageUrl } = defineProps<ChatHeaderProps>();
</script>

<template>
  <div
    class="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2"
  >
    <MobileToggle :serverId="serverId" />

    <Hash
      v-if="type === 'channel'"
      class="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2"
    />

    <UserAvatar
      v-if="type === 'conversation'"
      :src="imageUrl"
      class="h-8 w-8 md:h-8 md:w-8 mr-2"
    />

    <p class="font-semibold text-md text-black dark:text-white">
      {{ name }}
    </p>
    <div class="ml-auto flex items-center">
      <ChatVideoButton v-if="type === 'conversation'" />
      <SocketIndicator />
    </div>
  </div>
</template>
