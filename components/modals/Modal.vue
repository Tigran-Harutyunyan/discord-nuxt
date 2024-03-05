<script setup lang="ts">
// Custom modal for the case when cloudinary widget iframe did`t work inside <Dialog> component.
import { X } from "lucide-vue-next";

const emit = defineEmits(["close"]);
const { show } = defineProps<{
  show: boolean;
}>();
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
  >
    <div
      class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full bg-white text-black p-0 overflow-hidden bg-white text-black p-0 overflow-hidden"
    >
      <div
        class="flex flex-col space-y-2 text-center sm:text-left pt-8 px-6 cursor-pointer"
      >
        <div
          @click="$emit('close')"
          class="absolute top-3 right-3 p-0.5 transition-colors rounded-md hover:bg-secondary"
        >
          <X class="w-4 h-4" />
          <span class="sr-only">Close</span>
        </div>
        <h2
          class="text-foreground tracking-tight text-2xl text-center font-bold"
        >
          <slot name="name" />
        </h2>
        <p class="text-sm text-center text-zinc-500">
          <slot name="description" />
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>
