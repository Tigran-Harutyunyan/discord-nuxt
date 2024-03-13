<script setup lang="ts">
import { h } from "vue";
import qs from "query-string";
import { MemberRole, type Server } from "@prisma/client";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-vue-next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/UserAvatar.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { useModalsStore } from "@/stores/modals";
import { useMainStore } from "@/stores/main";

const { profile } = storeToRefs(useMainStore());

const { type, data, isOpen } = storeToRefs(useModalsStore());

const { onClose, updateServer, onMemberRoleChange } = useModalsStore();

const server = computed(() => data.value.server);

const roleIconMap = {
  GUEST: null,
  MODERATOR: h(ShieldCheck, {
    class: "h-4 w-4 mr-2 text-indigo-500",
  }),
  ADMIN: h(ShieldAlert, {
    class: "h-4 w-4 mr-2 text-rose-500",
  }),
};

const isModalOpen = computed(() => isOpen.value && type.value === "members");

const loadingId = ref("");

const onKick = async (memberId: string) => {
  try {
    loadingId.value = memberId;

    const url = qs.stringifyUrl({
      url: `/api/members/${memberId}`,
      query: {
        serverId: server.value?.id,
      },
    });

    const response = await $fetch<Server>(url, {
      method: "DELETE",
    });

    if (response?.id) {
      updateServer(response);
    }
  } catch (error) {
    console.log(error);
  } finally {
    loadingId.value = "";
  }
};

const onRoleChange = async (memberId: string, role: MemberRole) => {
  try {
    loadingId.value = memberId;

    const url = qs.stringifyUrl({
      url: `/api/members/${memberId}`,
      query: {
        serverId: server.value?.id,
      },
    });

    const response = await $fetch<Server>(url, {
      method: "PATCH",
      body: {
        role,
      },
    });

    if (response?.id) {
      updateServer(response);
      onMemberRoleChange();
    }
  } catch (error) {
    console.log(error);
  } finally {
    loadingId.value = "";
  }
};
</script>

<template>
  <Dialog v-model:open="isModalOpen">
    <DialogContent class="bg-white text-black overflow-hidden">
      <DialogClose as-child>
        <CloseDialogIcon @click="onClose"></CloseDialogIcon>
      </DialogClose>
      <DialogHeader class="pt-8 px-6">
        <DialogTitle class="text-2xl text-center font-bold">
          Manage Members
        </DialogTitle>
        <DialogDescription class="text-center text-zinc-500">
          {{ server?.members?.length }} Members
        </DialogDescription>
      </DialogHeader>
      <ScrollArea class="mt-8 max-h-[420px] pr-6">
        <div
          v-for="member in server?.members"
          :key="member.id"
          class="flex items-center gap-x-2 mb-6"
        >
          <UserAvatar :src="member.profile.imageUrl" />
          <div class="flex flex-col gap-y-1">
            <div class="text-xs font-semibold flex items-center gap-x-1">
              {{ member.profile.name }}
              <component :is="roleIconMap[member.role]" />
            </div>
            <p class="text-xs text-zinc-500">
              {{ member.profile.email }}
            </p>
          </div>

          <div
            class="ml-auto"
            v-if="profile?.id !== member.profileId && loadingId !== member.id"
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical class="h-4 w-4 text-zinc-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger class="flex items-center">
                    <ShieldQuestion class="w-4 h-4 mr-2" />
                    <span>Role</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        @click="onRoleChange(member.id, 'GUEST')"
                      >
                        <Shield class="h-4 w-4 mr-2" />
                        Guest

                        <Check
                          v-if="member.role === 'GUEST'"
                          class="h-4 w-4 ml-auto"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="onRoleChange(member.id, 'MODERATOR')"
                      >
                        <ShieldCheck class="h-4 w-4 mr-2" />
                        Moderator
                        <Check
                          v-if="member.role === 'MODERATOR'"
                          class="h-4 w-4 ml-2"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="onKick(member.id)">
                  <Gavel class="h-4 w-4 mr-2" />
                  Kick
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Loader2
            v-if="loadingId === member.id"
            class="animate-spin text-zinc-500 ml-auto w-4 h-4"
          />
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
