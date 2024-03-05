<script setup lang="ts">
import { cn } from "@/lib/utils";
import ActionTooltip from "@/components/ActionTooltip.vue";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

const router = useRouter();

const route = useRoute();

const { id, imageUrl, name } = defineProps<NavigationItemProps>();

const onClick = () => {
  router.push(`/servers/${id}`);
};
</script>

<template>
  <ActionTooltip side="right" align="center" :label="name">
    <button @click="onClick" class="group relative flex items-center">
      <div
        :class="
          cn(
            'absolute left-0 bg-primary rounded-r-full transition-all w-[4px]',
            route.params?.serverId !== id && 'group-hover:h-[20px]',
            route.params?.serverId === id ? 'h-[36px]' : 'h-[8px]'
          )
        "
      />
      <div
        :class="
          cn(
            'relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden',
            route.params?.serverId === id &&
              'bg-primary/10 text-primary rounded-[16px]'
          )
        "
      >
        <NuxtImg fill :src="imageUrl" alt="Channel" />
      </div>
    </button>
  </ActionTooltip>
</template>
