<script setup lang="ts">
import { ChannelType, MemberRole } from "@prisma/client";
import { Plus, Settings } from "lucide-vue-next";

import type { Server } from "@/types";
import ActionTooltip from "@/components/ActionTooltip.vue";

import { useModalsStore } from "@/stores/modals";

const { onOpen } = useModalsStore();

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: Server;
}

const { label, role, sectionType, channelType, server } =
  defineProps<ServerSectionProps>();
</script>

<template>
  <div class="flex items-center justify-between py-2">
    <p class="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
      {{ label }}
    </p>

    <ActionTooltip
      label="Create Channel"
      side="top"
      v-if="role !== MemberRole.GUEST && sectionType === 'channels'"
    >
      <button
        @click="onOpen('createChannel', { channelType, server })"
        class="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
      >
        <Plus class="h-4 w-4" />
      </button>
    </ActionTooltip>

    <ActionTooltip
      label="Manage Members"
      side="top"
      v-if="role === MemberRole.ADMIN && sectionType === 'members'"
    >
      <button
        @click="onOpen('members', { server })"
        class="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
      >
        <Settings class="h-4 w-4" />
      </button>
    </ActionTooltip>
  </div>
</template>
