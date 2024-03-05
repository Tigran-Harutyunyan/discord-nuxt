<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DialogClose } from "radix-vue";
import { Button } from "@/components/ui/button";

import { useModalsStore } from "@/stores/modals";

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { onClose, onOpen } = useModalsStore();

const router = useRouter();

const isLoading = ref(false);

const isModalOpen = isOpen.value && type.value === "leaveServer";

const onClick = async () => {
  try {
    isLoading.value = true;
    if (!data.value.server?.id) return;

    await $fetch(`/api/servers/${data.value.server?.id}/leave`, {
      method: "PATCH",
    });

    onClose();
    router.push("/");
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
        <CloseDialogIcon @click="onClose">Leave Server</CloseDialogIcon>
      </DialogClose>
      <DialogHeader class="pt-8 px-6">
        <DialogTitle class="text-2xl text-center font-bold">
          Invite Friends
        </DialogTitle>
        <DialogDescription class="text-center text-zinc-500">
          Are you sure you want to leave
          <span class="font-semibold text-indigo-500">{{ server?.name }}</span
          >?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="bg-gray-100 px-6 py-4">
        <div class="flex items-center justify-between w-full">
          <Button :disabled="isLoading" @click="onClose" variant="ghost">
            Cancel
          </Button>
          <Button :disabled="isLoading" @click="onClick" variant="primary">
            Confirm
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
