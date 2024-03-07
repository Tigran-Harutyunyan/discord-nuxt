<script setup lang="ts">
import { UserButton } from "vue-clerk";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import NavigationAction from "./NavigationAction.vue";
import NavigationItem from "./NavigationItem.vue";
import ModeToggle from "@/components/ModeToggle.vue";
import type { Server } from "@prisma/client";

import InitialModal from "@/components/modals/InitialModal.vue";

import { useModalsStore } from "@/stores/modals";

const { data } = storeToRefs(useModalsStore());

const showDialog = ref(false);

const servers = ref<Server[]>([]);

const { data: serverData, refresh } = useAsyncData("serverData", () =>
  $fetch("/api/servers")
);

const onDone = () => {
  showDialog.value = false;
  refresh();
};

watch(serverData, (newData) => {
  if (newData && Array.isArray(newData)) {
    servers.value = newData;
  }
});

watch(
  () => data.value.server,
  (newVal) => {
    servers.value.forEach((server) => {
      if (server.id === newVal?.id) {
        server.name = newVal.name;
        server.imageUrl = newVal.imageUrl;
      }
    });
  },
  {
    deep: true,
  }
);
</script>

<template>
  <InitialModal
    @done="onDone"
    @close="showDialog = false"
    v-if="showDialog"
    :show="showDialog"
  />
  <div
    class="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3"
  >
    <NavigationAction @open="showDialog = true" />
    <Separator
      class="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"
    />
    <ScrollArea class="flex-1 w-full" v-if="servers?.length">
      <div :key="server.id" class="mb-4" v-for="server in servers">
        <NavigationItem
          :id="server.id"
          :name="server.name"
          :imageUrl="server.imageUrl"
        />
      </div>
    </ScrollArea>
    <div class="pb-3 mt-auto flex items-center flex-col gap-y-4">
      <ModeToggle />
      <UserButton
        afterSignOutUrl="/"
        :appearance="{
          elements: {
            avatarBox: 'h-[48px] w-[48px]',
          },
        }"
      />
    </div>
  </div>
</template>
