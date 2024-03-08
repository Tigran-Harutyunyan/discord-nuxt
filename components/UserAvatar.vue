<script setup lang="ts">
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useClerkProvide } from "vue-clerk";
const { state } = useClerkProvide();

const { src } = defineProps<{
  src?: string;
}>();

const avatarUrl = computed(() => {
  return src ? src : state?.user?.imageUrl || "";
});
</script>

<template>
  <Avatar class="h-12 w-12">
    <AvatarImage :src="avatarUrl" />
  </Avatar>
</template>
