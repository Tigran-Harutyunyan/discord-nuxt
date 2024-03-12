<script setup lang="ts">
import { h } from "vue";
import type { Server, Channel, Member, Profile } from "@prisma/client";

type serverMember = Member & {
  profile: Profile;
};
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-vue-next";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import ServerHeader from "./ServerHeader.vue";
import ServerSearch from "./ServerSearch.vue";
import ServerSection from "./ServerSection.vue";
import ServerChannel from "./ServerChannel.vue";
import ServerMember from "./ServerMember.vue";
import { useModalsStore } from "@/stores/modals";
import { useMainStore } from "@/stores/main";

const { profile } = storeToRefs(useMainStore());

type ServerSidebarProps = Server & {
  members?: serverMember[];
  channels?: Channel[];
};
const route = useRoute();

const { data } = storeToRefs(useModalsStore());
const { updateServer } = useMainStore();

const server = ref<ServerSidebarProps | null>();

const isLoading = ref(false);

const params = useState("routeParams");

const getServer = async (serverId: string) => {
  if (!serverId || isLoading.value) return;
  if (server.value && server.value.id === serverId) return;

  isLoading.value = true;

  const response = await $fetch<ServerSidebarProps | null>(
    `/api/server/${route.params.serverId}`
  );

  isLoading.value = false;

  if (response?.id) {
    server.value = response;
    updateServer(server.value);
  }
};

if (data.value?.server?.id !== params.value?.serverId) {
  getServer(params.value?.serverId);
} else {
  server.value = data.value?.server;
}
watch(
  () => route.path,
  async () => {
    if (data.value?.server?.id !== route.params?.serverId) {
      getServer(route.params?.serverId as string);
    }
  }
);

watch(
  () => data.value?.server,
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

const role = computed(() => {
  if (!profile.value || !server.value?.members) return undefined;
  return server.value.members.find(
    (member) => member.profileId === profile.value?.id
  )?.role as MemberRole;
});

const textChannels = computed(() => {
  return server.value?.channels
    ? server.value?.channels.filter(
        (channel: Channel) => channel.type === ChannelType.TEXT
      )
    : [];
});

const audioChannels = computed(() => {
  return server.value?.channels
    ? server.value?.channels.filter(
        (channel: Channel) => channel.type === ChannelType.AUDIO
      )
    : [];
});

const videoChannels = computed(() => {
  return server.value?.channels
    ? server.value?.channels.filter(
        (channel: Channel) => channel.type === ChannelType.VIDEO
      )
    : [];
});

const members = computed(() => {
  if (!profile.value || !server.value?.members) return [];
  return server.value?.members.filter(
    (member: Member) => member.profileId !== profile?.value?.id
  );
});

const iconMap = {
  [ChannelType.TEXT]: h(Hash, {
    class: "mr-2 h-4 w-4",
  }),
  [ChannelType.AUDIO]: h(Mic, {
    class: "mr-2 h-4 w-4",
  }),
  [ChannelType.VIDEO]: h(Video, {
    class: "mr-2 h-4 w-4",
  }),
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: h(ShieldCheck, {
    class: "h-4 w-4 mr-2 text-indigo-500",
  }),
  [MemberRole.ADMIN]: h(ShieldAlert, {
    class: "h-4 w-4 mr-2 text-rose-500",
  }),
};

const chanelsData = computed(() => {
  return [
    {
      label: "Text Channels",
      type: "channel",
      data: textChannels.value?.map((channel: Channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Voice Channels",
      type: "channel",
      data: audioChannels.value?.map((channel: Channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Video Channels",
      type: "channel",
      data: videoChannels.value?.map((channel: Channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Members",
      type: "member",
      data: members.value?.map((member: Member) => ({
        id: member.id,
        name: member.profile.name,
        icon: roleIconMap[member.role],
      })),
    },
  ];
});
</script>

<template>
  <div
    v-if="server"
    class="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]"
  >
    <ServerHeader :server="server" :role="role" />
    <ScrollArea class="flex-1 px-3">
      <div class="mt-2">
        <ServerSearch :data="chanelsData" />
      </div>
      <Separator class="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

      <template v-if="!!textChannels?.length">
        <div class="mb-2">
          <ServerSection
            sectionType="channels"
            :channelType="ChannelType.TEXT"
            :role="role"
            label="Text Channels"
            :server="server"
          />
          <div class="space-y-[2px]">
            <ServerChannel
              v-for="channel in textChannels"
              :key="channel.id"
              :channel="channel"
              :role="role"
              :server="server"
            />
          </div>
        </div>
      </template>

      <div class="mb-2" v-if="!!audioChannels?.length">
        <ServerSection
          sectionType="channels"
          :channelType="ChannelType.AUDIO"
          :role="role"
          label="Audio Channels"
          :server="server"
        />
        <div class="space-y-[2px]">
          <ServerChannel
            v-for="channel in audioChannels"
            :key="channel.id"
            :channel="channel"
            :role="role"
            :server="server"
          />
        </div>
      </div>

      <div class="mb-2" v-if="!!videoChannels?.length">
        <ServerSection
          sectionType="channels"
          :channelType="ChannelType.VIDEO"
          :role="role"
          label="Video Channels"
          :server="server"
        />
        <div class="space-y-[2px]">
          <ServerChannel
            v-for="channel in videoChannels"
            :key="channel.id"
            :channel="channel"
            :role="role"
            :server="server"
          />
        </div>
      </div>

      <div class="mb-2" v-if="!!members?.length">
        <ServerSection
          sectionType="members"
          :role="role"
          label="Members"
          :server="server"
        />
        <div class="space-y-[2px]">
          <ServerMember
            v-for="member in members"
            :key="member.id"
            :member="member"
          />
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
