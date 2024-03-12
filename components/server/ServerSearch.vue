<script setup lang="ts">
import { Search } from "lucide-vue-next";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogClose } from "radix-vue";

const isOpen = ref(false);

interface ServerSearchProps {
  data: {
    label: string;
    type: "channel" | "member";
    data:
      | {
          icon: any;
          name: string;
          id: string;
        }[]
      | undefined;
  }[];
}

const { data } = defineProps<ServerSearchProps>();

const router = useRouter();

const route = useRoute();

const onClick = ({ id, type }: { id: string; type: "channel" | "member" }) => {
  isOpen.value = false;

  if (type === "member") {
    return router.push(
      `/servers/${route.params?.serverId}/conversations/${id}`
    );
  }

  if (type === "channel") {
    return router.push(`/servers/${route.params?.serverId}/channels/${id}`);
  }
};
const down = (e: KeyboardEvent) => {
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }
};

onMounted(() => {
  document.addEventListener("keydown", down);
});

onBeforeMount(() => {
  document.removeEventListener("keydown", down);
});
</script>

<template>
  <button
    @click="isOpen = true"
    class="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
  >
    <Search class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
    <p
      class="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition"
    >
      Search
    </p>
    <kbd
      class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto"
    >
      <span class="text-xs">⌘</span>K
    </kbd>
  </button>
  <CommandDialog :open="isOpen" @change="isOpen = false">
    <DialogClose as-child>
      <CloseDialogIcon @click="isOpen = false"></CloseDialogIcon>
    </DialogClose>
    <CommandInput placeholder="Search all channels and members" />
    <CommandList class="p-2">
      <CommandEmpty> No Results found </CommandEmpty>
      <template v-for="item in data">
        <CommandGroup
          :key="item.label"
          :heading="item.label"
          v-if="item.data?.length"
        >
          <CommandItem
            v-for="command in item.data"
            :value="command.name"
            :key="command.id"
            @select="onClick({ id: command.id, type: item.type })"
          >
            <component :is="command.icon" />
            <span>{{ command.name }}</span>
          </CommandItem>
        </CommandGroup>
      </template>
    </CommandList>
  </CommandDialog>
</template>
