<script setup lang="ts">
import qs from "query-string";
import { Video, VideoOff } from "lucide-vue-next";
import ActionTooltip from "@/components/ActionTooltip.vue";

const router = useRouter();
const route = useRoute();

const isVideo = computed(() => {
  return route?.query?.video;
});

const onClick = () => {
  const url = qs.stringifyUrl(
    {
      url: useRoute().path || "",
      query: {
        video: isVideo.value ? undefined : true,
      },
    },
    { skipNull: true }
  );

  router.push(url);
};

const Icon = computed(() => {
  return isVideo.value ? VideoOff : Video;
});
const tooltipLabel = computed(() => {
  return isVideo.value ? "End video call" : "Start video call";
});
</script>

<template>
  <ActionTooltip side="bottom" :label="tooltipLabel">
    <button @click="onClick" class="hover:opacity-75 transition mr-4">
      <Icon class="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
    </button>
  </ActionTooltip>
</template>
