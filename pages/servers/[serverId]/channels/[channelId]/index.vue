<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "server",
});
import { ChannelType, type Channel, type Member } from "@prisma/client";
import { useModalsStore } from "@/stores/modals";

const { updateChannelCounter, data } = storeToRefs(useModalsStore());

const route = useRoute();
const router = useRouter();

const { serverId, channelId } = route.params;

const channel = ref<Channel | undefined>();
const member = ref<Member | undefined>();

const response = await $fetch<Channel | undefined>(`/api/channel/${channelId}`);

if (response?.id) {
  channel.value = response;
}

const memberResponse = await $fetch<Member | undefined>(
  `/api/member/${serverId}`
);

if (memberResponse?.id) {
  member.value = memberResponse;
}

if (!channel.value || !member.value) {
  router.push("/");
}

watch(
  () => updateChannelCounter.value,
  () => {
    if (data?.value?.server?.channels) {
      data?.value?.server?.channels.forEach((item) => {
        if (item.id === channel.value?.id) {
          channel.value.name = item.name;
          channel.value.type = item.type;
        }
      });
    }
  }
);
</script>

<template>
  <div class="bg-white dark:bg-[#313338] flex flex-col h-full">
    <ChatHeader
      v-if="channel"
      :name="channel?.name"
      :serverId="channel.serverId"
      type="channel"
    />

    <template v-if="channel && channel.type === ChannelType.TEXT">
      <ClientOnly>
        <ChatMessages
          :member="member"
          :name="channel.name"
          :chatId="channel.id"
          type="channel"
          apiUrl="/api/messages"
          socketUrl="/api/socket/messages"
          :socketQuery="{
            channelId: channel.id,
            serverId: channel.serverId,
          }"
          paramKey="channelId"
          :paramValue="channel.id"
        />
      </ClientOnly>
      <ChatInput
        :name="channel.name"
        type="channel"
        apiUrl="/api/messages"
        :query="{
          channelId: channel.id,
          serverId: channel.serverId,
        }"
      />
    </template>

    <!-- <MediaRoom
      v-if="channel.type === ChannelType.AUDIO"
      :chatId="channel.id"
      :video="false"
      :audio="true"
    /> -->

    <MediaRoom
      v-if="channel && channel.type === ChannelType.VIDEO"
      :chatId="channel.id"
      :video="false"
      :audio="true"
    />
  </div>
</template>
