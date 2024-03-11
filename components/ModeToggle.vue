<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-vue-next";
import { useDark } from "@vueuse/core";
const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <Button
    class="bg-transparent border-0"
    variant="outline"
    size="icon"
    @click="toggleDark()"
  >
    <Moon v-if="isDark" class="h-[1.2rem] w-[1.2rem]" />
    <Sun v-else class="h-[1.2rem] w-[1.2rem]" />
  </Button>
</template>
