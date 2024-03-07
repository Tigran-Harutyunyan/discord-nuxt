<script setup lang="ts">
import { Check, Copy, RefreshCw } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DialogClose } from "radix-vue";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useOrigin } from "@/composables/useOrigin";
import { useModalsStore } from "@/stores/modals";

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { onClose, onOpen } = useModalsStore();

const copied = ref(false);

const isLoading = ref(false);

const origin = useOrigin();

const inviteUrl = computed(() => {
  return `${origin.value}/invite/${data.value?.server?.inviteCode}`;
});

const isModalOpen = isOpen.value && type.value === "invite";

const onCopy = () => {
  navigator.clipboard.writeText(inviteUrl.value);
  copied.value = true;

  setTimeout(() => {
    copied.value = false;
  }, 1000);
};

const onNew = async () => {
  try {
    isLoading.value = true;
    if (!data.value.server?.id) return;

    const response = await $fetch(
      `/api/servers/${data.value.server?.id}/invite-code`,
      {
        method: "PATCH",
      }
    );

    if (response && "inviteCode" in response) {
      onOpen("invite", { server: response });
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="isModalOpen">
    <DialogContent class="bg-white text-black p-0 overflow-hidden">
      <DialogClose as-child>
        <CloseDialogIcon @click="onClose"></CloseDialogIcon>
      </DialogClose>
      <DialogHeader class="pt-8 px-6">
        <DialogTitle class="text-2xl text-center font-bold">
          Invite Friends
        </DialogTitle>
      </DialogHeader>
      <div class="p-6">
        <Label
          class="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
        >
          Server invite link
        </Label>
        <div class="flex items-center mt-2 gap-x-2">
          <Input
            :disabled="isLoading"
            class="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
            :value="inviteUrl"
          />
          <Button :disabled="isLoading" @click="onCopy" size="icon">
            <Check class="w-4 h-4" v-if="copied" />
            <Copy class="w-4 h-4" v-else />
          </Button>
        </div>
        <Button
          @click="onNew"
          :disabled="isLoading"
          variant="link"
          size="sm"
          class="text-xs text-zinc-500 mt-4"
        >
          Generate a new link
          <RefreshCw class="w-4 h-4 ml-2" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
