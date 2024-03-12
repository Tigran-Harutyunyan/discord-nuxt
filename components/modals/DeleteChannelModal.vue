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
import { useToast } from "@/components/ui/toast/use-toast";
import { Button } from "@/components/ui/button";
import { useModalsStore } from "@/stores/modals";
import { type Server, type Channel } from "@prisma/client";

type serverWithChannels = Server & { channels?: Channel[] };

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { onClose, onUpdateChannels } = useModalsStore();

const isModalOpen = computed(() => {
  return isOpen.value && type.value === "deleteChannel";
});

const { toast } = useToast();

const { server, channel } = data.value;

const isLoading = ref(false);

const router = useRouter();

const route = useRoute();

const onClick = async () => {
  try {
    isLoading.value = true;

    const url = qs.stringifyUrl({
      url: `/api/channels/${channel?.id}`,
      query: {
        serverId: server?.id,
      },
    });

    const response = await $fetch<serverWithChannels | undefined>(url, {
      method: "DELETE",
    });

    if (response?.id) {
      if (response.channels) {
        onUpdateChannels(response.channels);
      }
      toast({
        variant: "default",
        description: `${response.name} channel was deleted`,
        duration: 3000,
      });
      onClose();
    }
    debugger;

    if (route.params.channelId && route.params.channelId === channel?.id) {
      router.push(`/servers/${server?.id}`);
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
          Delete Channel
        </DialogTitle>
        <DialogDescription class="text-center text-zinc-500">
          Are you sure you want to do this? <br />
          <span class="text-indigo-500 font-semibold"
            >#{{ channel?.name }}</span
          >
          will be permanently deleted.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="bg-gray-100 px-6 py-4">
        <div class="flex items-center justify-between w-full">
          <Button :disabled="isLoading" @click="onClose" variant="ghost">
            Cancel
          </Button>
          <Button :disabled="isLoading" variant="primary" @click="onClick">
            {{ isLoading ? "Deleting..." : "Confirm" }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
