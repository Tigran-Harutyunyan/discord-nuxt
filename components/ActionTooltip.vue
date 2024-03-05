<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionTooltipProps {
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const { label, side, align } = defineProps<ActionTooltipProps>();
</script>

<template>
  <TooltipProvider>
    <Tooltip :delay-duration="50">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipContent :side="side" :align="align">
        <p class="font-semibold text-sm capitalize">
          {{ label.toLowerCase() }}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
