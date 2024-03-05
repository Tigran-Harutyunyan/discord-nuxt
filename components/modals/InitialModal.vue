<script setup lang="ts">
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

const { show } = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["done"]);

const { toast } = useToast();

const isLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, {
      message: "Server name is required.",
    }),
    imageUrl: z.string().min(1, {
      message: "Server image is required.",
    }),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onImgUpload = (src: string) => {
  form.setFieldValue("imageUrl", src);
};

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const response = await $fetch("/api/servers", {
      method: "POST",
      body: { ...values },
    });

    if (response?.id) {
      form.resetForm();
      emit("done");
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
  <Modal :show="show" @close="$emit('close')">
    <template #name> Customize your server </template>
    <template #description>
      Give your server a personality with a name and an image. You can always
      change it later.
    </template>
    <form @submit.prevent.stop="onSubmit" class="space-y-8">
      <div class="space-y-8 px-6">
        <div class="flex items-center justify-center text-center">
          <FormField v-slot="{ componentField }" name="imageUrl">
            <FormItem>
              <FormControl>
                <ImageUpload
                  @click.stop.preveent="showDialog = false"
                  :disabled="isLoading"
                  :value="componentField.modelValue"
                  @change="onImgUpload"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField name="name" v-slot="{ componentField }">
          <FormItem>
            <FormLabel
              class="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
            >
              Server name
            </FormLabel>
            <FormControl>
              <Input
                :disabled="isLoading"
                v-bind="componentField"
                class="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                placeholder="Enter server name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <div
        class="flex flex-col space-y-2 sm:space-y-0 mt-1.5 sm:flex-row sm:justify-end sm:space-x-2 bg-gray-100 px-6 py-4"
      >
        <Button variant="primary" :disabled="isLoading"> Create </Button>
      </div>
    </form>
  </Modal>
</template>
