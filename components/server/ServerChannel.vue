<script setup lang="ts">
import { cn } from "@/lib/utils";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-vue-next";
import { ChannelType, MemberRole } from "@prisma/client";
import { type Server, type Channel } from "@prisma/client";
type serverWithChannels = Server & { channels?: Channel[] };

import { useModalsStore } from "@/stores/modals";

const { onOpen } = useModalsStore();

interface ServerChannelProps {
  channel: Channel;
  server: serverWithChannels;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

const { channel, server, role } = defineProps<ServerChannelProps>();

const router = useRouter();

const route = useRoute();

const onClick = () => {
  router.push(`/servers/${route.params?.serverId}/channels/${channel.id}`);
};

const onAction = (action: ModalType) => {
  onOpen(action, {
    channel: server.channels?.find((item) => item.id === channel?.id),
    server,
  });
};
</script>

<template>
  <button
    @click="onClick"
    :class="
      cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        route.params?.channelId === channel.id &&
          'bg-zinc-700/20 dark:bg-zinc-700'
      )
    "
  >
    <component
      :is="iconMap[channel.type]"
      class="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400"
    />
    <p
      :class="
        cn(
          'line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
          route.params?.channelId === channel.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-white'
        )
      "
    >
      {{ channel.name }}
    </p>

    <div
      class="ml-auto flex items-center gap-x-2"
      v-if="channel.name !== 'general' && role !== MemberRole.GUEST"
    >
      <ActionTooltip label="Edit">
        <Edit
          @click.stop="onAction('editChannel')"
          class="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
        />
      </ActionTooltip>
      <ActionTooltip label="Delete">
        <Trash
          @click.stop="onAction('deleteChannel')"
          class="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
        />
      </ActionTooltip>
    </div>

    <Lock
      v-if="channel.name === 'general'"
      class="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400"
    />
  </button>
</template>
