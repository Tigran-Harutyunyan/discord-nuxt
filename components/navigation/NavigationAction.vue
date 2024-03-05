<script setup lang="ts">
import { Plus } from "lucide-vue-next";
</script>

<template>
  <ActionTooltip side="right" align="center" label="Add a server">
    <button @click="$emit('open')" class="group flex items-center">
      <div
        class="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500"
      >
        <Plus
          class="group-hover:text-white transition text-emerald-500"
          :size="25"
        />
      </div>
    </button>
  </ActionTooltip>
</template>
