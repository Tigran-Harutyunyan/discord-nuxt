<script setup lang="ts">
import type { Profile, Member, Conversation } from "@prisma/client";

type MemberWithProfile = Member & { profile: Profile };

type FullConversation = Conversation & {
  memberOne: MemberWithProfile;
  memberTwo: MemberWithProfile;
};

definePageMeta({
  middleware: "auth",
  layout: "server",
});
const route = useRoute();

const searchParams = route.params;

const { serverId, memberId } = route.params;

const memberOne = ref<MemberWithProfile | null>(null);
const memberTwo = ref<MemberWithProfile | null>(null);
const otherMember = ref<MemberWithProfile | null>(null);
const conversation = ref<FullConversation | undefined>();
const currentMember = ref<Member | undefined>();

const getData = async () => {
  const profile = await $fetch<Profile | undefined>("/api/profile");

  if (!profile?.id) {
    return navigateTo("sign-in");
  }

  const currentMemberData = await $fetch<Member | undefined>(
    `/api/member/current-member?profileId=${profile.id}&serverId=${serverId}`
  );

  if (!currentMemberData?.id) {
    return navigateTo("/");
  }

  currentMember.value = currentMemberData;

  const conversationData = await $fetch<FullConversation | undefined>(
    `/api/conversation/get_or_create?memberOneId=${currentMemberData.id}&memberTwoId=${memberId}&profileId=${profile.id}`
  );

  if (!conversationData?.id) {
    return navigateTo(`/servers/${serverId}`);
  }

  conversation.value = conversationData;

  memberOne.value = conversationData.memberOne;
  memberTwo.value = conversationData.memberTwo;
  otherMember.value =
    conversationData.memberOne.profileId === profile.id
      ? conversationData.memberTwo
      : conversationData.memberOne;
};

onMounted(() => {
  getData();
});
</script>
<template>
  <div
    class="bg-white dark:bg-[#313338] flex flex-col h-full"
    v-if="conversation && otherMember && currentMember"
  >
    <ChatHeader
      :imageUrl="otherMember.profile.imageUrl"
      :name="otherMember.profile.name"
      :serverId="serverId"
      type="conversation"
    />

    <MediaRoom
      v-if="searchParams.video"
      :chatId="conversation.id"
      :video="true"
      :audio="true"
    />
    <template v-if="!searchParams.video">
      <ClientOnly>
        <ChatMessages
          v-if="!searchParams.video"
          :member="currentMember"
          :name="otherMember?.profile.name"
          :chatId="conversation.id"
          type="conversation"
          apiUrl="/api/direct-messages"
          paramKey="conversationId"
          :paramValue="conversation.id"
          socketUrl="/api/socket/direct-messages"
          :socketQuery="{
            conversationId: conversation.id,
          }"
        />
      </ClientOnly>
      <ChatInput
        :name="otherMember.profile.name"
        type="conversation"
        apiUrl="/api/direct-messages"
        :query="{
          conversationId: conversation.id,
        }"
      />
    </template>
  </div>
</template>
