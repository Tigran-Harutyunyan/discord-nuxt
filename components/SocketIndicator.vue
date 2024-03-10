<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { useSocketStore } from "@/stores/socket";

const { isConnected } = storeToRefs(useSocketStore());
</script>

<template>
  <Badge
    v-if="isConnected"
    variant="outline"
    class="bg-emerald-600 text-white border-none"
  >
    Live: Real-time updates
  </Badge>

  <Badge v-else variant="outline" class="bg-yellow-600 text-white border-none">
    Fallback: Polling every 1s
  </Badge>
</template>
