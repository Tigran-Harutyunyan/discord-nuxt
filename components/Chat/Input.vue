<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import qs from "query-string";
import { Plus } from "lucide-vue-next";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useModalsStore } from "@/stores/modals";
const { onOpen } = useModalsStore();

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const { apiUrl, query, name, type } = defineProps<ChatInputProps>();

const formSchema = toTypedSchema(
  z.object({
    content: z.string().min(1),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const isLoading = ref(false);

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  const url = qs.stringifyUrl({
    url: apiUrl,
    query,
  });

  const { serverId } = useRoute().params;

  try {
    await $fetch(url, {
      method: "POST",
      body: { type: "post", serverId, ...values },
    });
    form.setFieldValue("content", "");
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
});

const onInsertEmoji = (emoji: string) => {
  const newText = form.values?.content
    ? `${form.values?.content} ${emoji}`
    : emoji;
  form.setFieldValue("content", newText);
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <FormField v-slot="{ componentField }" name="content">
      <FormItem>
        <FormControl>
          <div class="relative p-4 pb-6">
            <button
              type="button"
              @click="onOpen('messageFile', { apiUrl, query })"
              class="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
            >
              <Plus class="text-white dark:text-[#313338]" />
            </button>
            <Input
              :disabled="isLoading"
              v-bind="componentField"
              class="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
              :placeholder="`Message ${
                type === 'conversation' ? name : '#' + name
              }`"
            />
            <div class="absolute top-7 right-8">
              <!-- <EmojiPicker @change="onInsertEmoji" /> -->
            </div>
          </div>
        </FormControl>
      </FormItem>
    </FormField>
  </form>
</template>
