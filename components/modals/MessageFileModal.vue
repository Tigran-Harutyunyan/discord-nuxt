<script setup lang="ts">
import qs from "query-string";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useToast } from "@/components/ui/toast/use-toast";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import Modal from "@/components/modals/Modal.vue";

import { useModalsStore } from "@/stores/modals";

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { onClose } = useModalsStore();

const isModalOpen = computed(() => {
  return isOpen.value && type.value === "messageFile";
});

const emit = defineEmits(["done", "close"]);

const { toast } = useToast();

const isLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    fileUrl: z.string().min(1, {
      message: "Attachment is required.",
    }),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onFileUpload = (src: string) => {
  form.setFieldValue("fileUrl", src);
};

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  const { apiUrl, query } = data.value;

  const url = qs.stringifyUrl({
    url: apiUrl || "",
    query,
  });

  try {
    const response = await $fetch(url, {
      method: "POST",
      body: {
        ...values,
        content: form.values.fileUrl,
        serverId: useRoute().params.serverId,
      },
    });

    if (response?.id) {
      form.resetForm();
      onClose();
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
</script>

<template>
  <Modal :show="isModalOpen" @close="onClose">
    <template #name> Add an attachment </template>
    <template #description> Send a file as a message </template>
    <form @submit.prevent.stop="onSubmit" class="space-y-8">
      <div class="space-y-8 px-6">
        <div class="flex items-center justify-center text-center">
          <FormField v-slot="{ componentField }" name="fileUrl">
            <FormItem>
              <FormControl>
                <ImageUpload
                  :disabled="isLoading"
                  :value="componentField.modelValue"
                  @change="onFileUpload"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
      <div
        class="flex flex-col space-y-2 sm:space-y-0 mt-1.5 sm:flex-row sm:justify-end sm:space-x-2 bg-gray-100 px-6 py-4"
      >
        <Button variant="primary" :disabled="isLoading">
          {{ isLoading ? "Sending..." : "Send" }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
