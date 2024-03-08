<script setup lang="ts">
import { type Member, MemberRole, type Profile } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar.vue";
import { h } from "vue";

interface ServerMemberProps {
  member: Member & { profile: Profile };
}

const { member } = defineProps<ServerMemberProps>();

const route = useRoute();
const router = useRouter();

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: h(ShieldCheck, {
    class: "h-4 w-4 ml-2 text-indigo-500",
  }),

  [MemberRole.ADMIN]: h(ShieldAlert, {
    class: "h-4 w-4 ml-2 text-rose-500",
  }),
};

const onClick = () => {
  router.push(`/servers/${route.params?.serverId}/conversations/${member.id}`);
};
</script>

<template>
  <button
    @click="onClick"
    :class="
      cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        route.params?.memberId === member.id &&
          'bg-zinc-700/20 dark:bg-zinc-700'
      )
    "
  >
    <UserAvatar :src="member.profile.imageUrl" class="h-8 w-8 md:h-8 md:w-8" />
    <p
      :class="
        cn(
          'text-left font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
          route.params?.memberId === member.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-white'
        )
      "
    >
      {{ member.profile.name }}
    </p>

    <component :is="roleIconMap[member.role]" />
  </button>
</template>
