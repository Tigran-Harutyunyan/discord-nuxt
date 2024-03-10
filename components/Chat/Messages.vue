<script setup lang="ts">
import { format } from "date-fns";
import type { Member, Message, Profile } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-vue-next";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

const {
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
} = defineProps<ChatMessagesProps>();

const queryKey = `chat:${chatId}`;
const addKey = `chat:${chatId}:messages`;
const updateKey = `chat:${chatId}:messages:update`;

const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
  useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
  });

useChatSocket({ queryKey, addKey, updateKey });
</script>

<template>
  <div
    v-if="status === 'pending'"
    class="flex flex-col flex-1 justify-center items-center"
  >
    <Loader2 class="h-7 w-7 text-zinc-500 animate-spin my-4" />
    <p class="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
  </div>

  <div
    v-else-if="status === 'error'"
    class="flex flex-col flex-1 justify-center items-center"
  >
    <ServerCrash class="h-7 w-7 text-zinc-500 my-4" />
    <p class="text-xs text-zinc-500 dark:text-zinc-400">
      Something went wrong!
    </p>
  </div>

  <div v-else ref="chatRef" class="flex-1 flex flex-col py-4 overflow-y-auto">
    <div v-if="!hasNextPage" class="flex-1"></div>
    <ChatWelcome v-if="!hasNextPage" :type="type" :name="name" />

    <div v-if="hasNextPage" class="flex justify-center">
      <Loader2
        v-if="isFetchingNextPage"
        class="h-6 w-6 text-zinc-500 animate-spin my-4"
      />

      <button
        v-else
        @click="fetchNextPage()"
        class="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
      >
        Load previous messages
      </button>
    </div>

    <div class="flex flex-col-reverse mt-auto">
      <template v-for="(group, i) in data?.pages">
        <ChatItem
          v-for="message in group.items"
          :key="message.id"
          :id="message.id"
          :currentMember="member"
          :member="message.member"
          :content="message.content"
          :fileUrl="message.fileUrl"
          :deleted="message.deleted"
          :timestamp="format(new Date(message.createdAt), DATE_FORMAT)"
          :isUpdated="message.updatedAt !== message.createdAt"
          :socketUrl="socketUrl"
          :socketQuery="socketQuery"
        />
      </template>
    </div>
    <div ref="bottomRef"></div>
  </div>
</template>
