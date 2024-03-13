<script setup lang="ts">
import { format } from "date-fns";
import type { Member } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-vue-next";
import { useModalsStore } from "@/stores/modals";

const { updatedMemberEventCount } = storeToRefs(useModalsStore());

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

const chatRef = ref<HTMLInputElement>();
const bottomRef = ref<HTMLInputElement>();
const hasInitialized = ref(false);

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
  refetch,
} = useChatQuery({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
});

useChatSocket({ queryKey, addKey, updateKey });

const handleScroll = () => {
  const scrollTop = chatRef.value?.scrollTop;

  if (scrollTop === 0 && !isFetchingNextPage && !!hasNextPage) {
    fetchNextPage();
  }
};

onMounted(() => {
  chatRef.value?.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  chatRef.value?.removeEventListener("scroll", handleScroll);
});

watch(
  () => updatedMemberEventCount.value,
  () => {
    refetch();
  }
);

const onChanges = () => {
  const shouldAutoScroll = () => {
    if (!hasInitialized.value && bottomRef.value) {
      hasInitialized.value = true;
      return true;
    }

    if (!chatRef.value) {
      return false;
    }

    const distanceFromBottom =
      chatRef.value.scrollHeight -
      chatRef.value.scrollTop -
      chatRef.value.clientHeight;
    return distanceFromBottom <= 100;
  };

  if (shouldAutoScroll()) {
    setTimeout(() => {
      bottomRef?.value?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
  }
};

watch(
  () => data.value?.pages?.[0]?.items?.length,
  () => {
    onChanges();
  },
  {
    deep: true,
    immediate: true,
  }
);
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
    v-if="status === 'error'"
    class="flex flex-col flex-1 justify-center items-center"
  >
    <ServerCrash class="h-7 w-7 text-zinc-500 my-4" />
    <p class="text-xs text-zinc-500 dark:text-zinc-400">
      Something went wrong!
    </p>
  </div>

  <div ref="chatRef" class="flex-1 flex flex-col py-4 overflow-y-auto">
    <template v-if="status !== 'pending' && status !== 'error'">
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
    </template>
    <div ref="bottomRef"></div>
  </div>
</template>
