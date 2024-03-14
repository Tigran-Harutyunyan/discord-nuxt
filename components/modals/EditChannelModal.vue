<script setup lang="ts">
import qs from "query-string";

import * as z from "zod";
import { ChannelType, type Server, type Channel } from "@prisma/client";
type serverWithChannels = Server & { channels?: Channel[] };

import { toTypedSchema } from "@vee-validate/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModalsStore } from "@/stores/modals";
import { useMainStore } from "@/stores/main";

const { updateServer } = useMainStore();
const { type, data, isOpen } = storeToRefs(useModalsStore());
const { onClose, onSaveChannelChanges } = useModalsStore();

const { toast } = useToast();

const isLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, {
        message: "Channel name is required.",
      })
      .refine((name) => name !== "general", {
        message: "Channel name cannot be 'general'",
      }),
    type: z.nativeEnum(ChannelType),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const isModalOpen = computed(() => {
  return isOpen.value && type.value === "editChannel";
});

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;

  const url = qs.stringifyUrl({
    url: `/api/channels/${data.value.channel?.id}`,
    query: {
      serverId: data.value.server?.id,
    },
  });

  try {
    const response = await $fetch<serverWithChannels | undefined>(url, {
      method: "PATCH",
      body: { ...values },
    });

    if (response?.id) {
      form.resetForm();

      if (response?.id) {
        updateServer(response);
        onSaveChannelChanges({
          id: data.value.channel?.id,
          name: values.name,
          type: values.type,
        });
      }

      toast({
        variant: "default",
        description: `${response.name} channel is updated`,
        duration: 3000,
      });

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

onMounted(() => {
  if (data.value.channel) {
    form.setFieldValue("name", data.value.channel.name);
    form.setFieldValue("type", data.value.channel.type || ChannelType.TEXT);
  }
});
</script>

<template>
  <Dialog v-model:open="isModalOpen">
    <DialogContent class="bg-white text-black p-0 overflow-hidden">
      <DialogClose as-child>
        <CloseDialogIcon @click="onClose"></CloseDialogIcon>
      </DialogClose>

      <DialogHeader class="pt-8 px-6">
        <DialogTitle class="text-2xl text-center font-bold">
          Edit Channel
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-8">
        <div class="space-y-8 px-6">
          <FormField name="name" v-slot="{ componentField }">
            <FormItem class="col-span-2 md:col-span-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  :disabled="isLoading"
                  v-bind="componentField"
                  placeholder="Enter channel name"
                  class="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="type" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Channel Type</FormLabel>
              <Select :disabled="isLoading" v-bind="componentField">
                <FormControl>
                  <SelectTrigger
                    class="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none"
                  >
                    <SelectValue placeholder="Select a channel type" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem
                    v-for="type in Object.values(ChannelType)"
                    :key="type"
                    :value="type"
                    class="capitalize"
                  >
                    {{ type.toLowerCase() }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <DialogFooter class="bg-gray-100 px-6 py-4">
          <Button variant="primary" :disabled="isLoading">
            {{ isLoading ? "Saving..." : "Save" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
