<script setup lang="ts">
import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose } from "radix-vue";

import { Button } from "@/components/ui/button";

import { useModalsStore } from "@/stores/modals";

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { apiUrl, query } = data.value;

const { onClose } = useModalsStore();

const isLoading = ref(false);

const isModalOpen = isOpen.value && type.value === "deleteMessage";

const onClick = async () => {
  try {
    isLoading.value = true;
    const url = qs.stringifyUrl({
      url: apiUrl || "",
      query,
    });

    await $fetch(url, {
      method: "delete",
    });

    onClose();
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
      <DialogHeader class="pt-8 px-6">
        <DialogClose as-child>
          <CloseDialogIcon @click="onClose"></CloseDialogIcon>
        </DialogClose>
        <DialogTitle class="text-2xl text-center font-bold">
          Delete Message
        </DialogTitle>
        <DialogDescription class="text-center text-zinc-500">
          Are you sure you want to do this? <br />
          The message will be permanently deleted.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="bg-gray-100 px-6 py-4">
        <div class="flex items-center justify-between w-full">
          <Button :disabled="isLoading" @click="onClose" variant="ghost">
            Cancel
          </Button>
          <Button :disabled="isLoading" variant="primary" @click="onClick">
            {{ isLoading ? "Confirming..." : "Confirm" }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
