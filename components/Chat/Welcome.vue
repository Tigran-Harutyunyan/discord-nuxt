<script setup lang="ts">
import { Hash } from "lucide-vue-next";

interface ChatWelcomeProps {
  name: string;
  type: "channel" | "conversation";
}

const { name, type } = defineProps<ChatWelcomeProps>();
</script>

<template>
  <div class="space-y-2 px-4 mb-4">
    <div
      v-if="type === 'channel'"
      class="h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center"
    >
      <Hash class="h-12 w-12 text-white" />
    </div>

    <p class="text-xl md:text-3xl font-bold">
      {{ type === "channel" ? "Welcome to #" : "" }}{{ name }}
    </p>
    <p class="text-zinc-600 dark:text-zinc-400 text-sm">
      {{
        type === "channel"
          ? `This is the start of the #${name} channel.`
          : `This is the start of your conversation with ${name}`
      }}
    </p>
  </div>
</template>
