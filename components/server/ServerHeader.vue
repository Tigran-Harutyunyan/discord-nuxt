<script setup lang="ts">
import type { Server } from "@/types";
import { MemberRole } from "@prisma/client";

import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
  ChevronUp,
} from "lucide-vue-next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useModalsStore } from "@/stores/modals";

const { onOpen } = useModalsStore();

interface ServerHeaderProps {
  server: Server;
  role?: MemberRole;
}

const { server, role } = defineProps<ServerHeaderProps>();

const isAdmin = role === MemberRole.ADMIN;
const isModerator = isAdmin || role === MemberRole.MODERATOR;
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="focus:outline-none">
      <div
        class="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        {{ server.name }}
        <ChevronDown class="h-5 w-5 ml-auto chevron-down" />
        <ChevronUp class="h-5 w-5 ml-auto chevron-up" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]"
    >
      <DropdownMenuItem
        v-if="isModerator"
        @click="onOpen('invite', { server })"
        class="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
      >
        Invite People
        <UserPlus class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="isAdmin"
        @click="onOpen('editServer', { server })"
        class="px-3 py-2 text-sm cursor-pointer"
      >
        Server Settings
        <Settings class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="isAdmin"
        @click="onOpen('members', { server })"
        class="px-3 py-2 text-sm cursor-pointer"
      >
        Manage Members
        <Users class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="isModerator"
        @click="onOpen('createChannel')"
        class="px-3 py-2 text-sm cursor-pointer"
      >
        Create Channel
        <PlusCircle class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>

      <DropdownMenuSeparator v-if="isModerator" />

      <DropdownMenuItem
        v-if="isAdmin"
        @click="onOpen('deleteServer', { server })"
        class="text-rose-500 px-3 py-2 text-sm cursor-pointer"
      >
        Delete Server
        <Trash class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>
      <DropdownMenuItem
        v-else
        @click="onOpen('leaveServer', { server })"
        class="text-rose-500 px-3 py-2 text-sm cursor-pointer"
      >
        Leave Server
        <LogOut class="h-4 w-4 ml-auto" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
<style scoped>
.chevron-up,
.chevron-down {
  display: none;
}

button[data-state="open"] .chevron-up,
button[data-state="closed"] .chevron-down {
  display: block;
}
</style>
