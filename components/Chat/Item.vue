<script setup lang="ts">
import { cn } from "@/lib/utils";
import { h } from "vue";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useToast } from "@/components/ui/toast/use-toast";
import { type Message } from "@prisma/client";

import qs from "query-string";
import { type Member, MemberRole, type Profile } from "@prisma/client";
import {
  Edit,
  FileIcon,
  ShieldAlert,
  ShieldCheck,
  Trash,
} from "lucide-vue-next";
import UserAvatar from "@/components/UserAvatar.vue";
import ActionTooltip from "@/components/ActionTooltip.vue";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useModalsStore } from "@/stores/modals";

const { onOpen } = useModalsStore();

const { toast } = useToast();

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: h(ShieldCheck, {
    class: "h-4 w-4 ml-2 text-indigo-500",
  }),

  ADMIN: h(ShieldAlert, {
    class: "h-4 w-4 ml-2 text-rose-500",
  }),
};

const {
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
} = defineProps<ChatItemProps>();

const localContent = ref(content);

const isEditing = ref(false);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();

const fileType = fileUrl?.split(".").pop();

const isAdmin = currentMember.role === MemberRole.ADMIN;
const isModerator = currentMember.role === MemberRole.MODERATOR;
const isOwner = currentMember.id === member.id;
const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
const canEditMessage = !deleted && isOwner && !fileUrl;
const isPDF = fileType === "pdf" && fileUrl;
const isImage = !isPDF && fileUrl;

const formSchema = toTypedSchema(
  z.object({
    content: z.string().min(1),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const url = qs.stringifyUrl({
      url: `${socketUrl}/${id}`,
      query: socketQuery,
    });

    const response = await $fetch<Message | undefined>(url, {
      method: "PATCH",
      body: { ...values },
    });

    if (response?.id) {
      localContent.value = response.content;
      isEditing.value = false;
    }
  } catch (error) {
    toast({
      variant: "destructive",
      description: error?.message,
      duration: 3000,
    });
  } finally {
    isLoading.value = false;
  }
});

const onMemberClick = () => {
  if (member.id === currentMember.id) {
    return;
  }

  router.push(`/servers/${route.params?.serverId}/conversations/${member.id}`);
};

watch(
  () => isEditing.value,
  (newVal) => {
    if (newVal) form.setFieldValue("content", localContent.value);
  }
);
</script>

<template>
  <div
    @keyup.esc="isEditing = false"
    class="relative group flex items-center hover:bg-black/5 p-4 transition w-full"
  >
    <div class="group flex gap-x-2 items-start w-full relative">
      <div
        @click="onMemberClick"
        class="cursor-pointer hover:drop-shadow-md transition"
      >
        <UserAvatar :src="member.profile.imageUrl" />
      </div>
      <div class="flex flex-col w-full">
        <div class="flex items-center gap-x-2">
          <div class="flex items-center">
            <p
              @click="onMemberClick"
              class="font-semibold text-sm hover:underline cursor-pointer"
            >
              {{ member.profile.name }}
            </p>
            <ActionTooltip :label="member.role">
              <component :is="roleIconMap[member.role]"></component>
            </ActionTooltip>
          </div>
          <span class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ timestamp }}
          </span>
        </div>

        <a
          v-if="isImage"
          :href="fileUrl || ''"
          target="_blank"
          rel="noopener noreferrer"
          class="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
        >
          <NuxtImg
            :src="fileUrl || ''"
            :alt="content"
            fill
            class="object-cover"
          />
        </a>

        <div
          v-if="isPDF"
          class="relative flex items-center p-2 mt-2 rounded-md bg-background/10"
        >
          <FileIcon class="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
          <a
            :href="fileUrl || ''"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
          >
            PDF File
          </a>
        </div>

        <p
          v-if="!fileUrl && !isEditing"
          :class="
            cn(
              'text-sm text-zinc-600 dark:text-zinc-300',
              deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
            )
          "
        >
          {{ content }}

          <span
            v-if="isUpdated && !deleted"
            class="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400"
          >
            (edited)
          </span>
        </p>

        <div v-if="!fileUrl && isEditing">
          <form
            @submit.prevent="onSubmit"
            class="flex items-center w-full gap-x-2 pt-2"
          >
            <FormField v-slot="{ componentField }" name="content">
              <FormItem class="flex-1">
                <FormControl>
                  <div class="relative w-full">
                    <Input
                      @keyup.enter="onSubmit"
                      :disabled="isLoading"
                      class="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                      placeholder="Edited message"
                      v-bind="componentField"
                    />
                  </div>
                </FormControl>
              </FormItem>
            </FormField>
            <Button :disabled="isLoading" size="sm" variant="primary">
              {{ isLoading ? "Saving" : "Save" }}
            </Button>
          </form>
          <span class="text-[10px] mt-1 text-zinc-400">
            Press escape to cancel, enter to save
          </span>
        </div>
      </div>
    </div>
    <template v-if="canDeleteMessage">
      <div
        class="hidden group-hover:flex items-center gap-x-2 absolute p-1 top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm"
      >
        <ActionTooltip label="Edit" v-if="canEditMessage">
          <Edit
            @click="isEditing = !isEditing"
            class="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          />
        </ActionTooltip>

        <ActionTooltip label="Delete">
          <Trash
            @click="
              onOpen('deleteMessage', {
                apiUrl: `${socketUrl}/${id}`,
                query: socketQuery,
              })
            "
            class="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          />
        </ActionTooltip>
      </div>
    </template>
  </div>
</template>
