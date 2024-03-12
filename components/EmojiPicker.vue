<script setup lang="ts">
import { Smile } from "lucide-vue-next";
import { Picker, EmojiIndex } from "@/components/emoji-mart-vue-fast/src/";
import data from "@/components/emoji-mart-vue-fast/data/all.json";
// Import default CSS
import "@/components/emoji-mart-vue-fast/css/emoji-mart.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const emit = defineEmits(["change"]);

let emojiIndex = new EmojiIndex(data);

const showEmoji = (emoji) => {
  emit("change", emoji.native);
};
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <Smile
        class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
      />
    </PopoverTrigger>
    <PopoverContent
      side="right"
      :sideOffset="40"
      class="bg-transparent border-none shadow-none drop-shadow-none mb-16"
    >
      <Picker :data="emojiIndex" @select="showEmoji" />
    </PopoverContent>
  </Popover>
</template>
