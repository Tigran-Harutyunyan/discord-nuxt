<script setup lang="ts">
import { type Channel, type Server } from "@prisma/client";
type serverWithChannels = Server & { channels?: Channel[] };

definePageMeta({
  middleware: "auth",
  layout: "server",
});

const route = useRoute();
const router = useRouter();

const serverId = route.params.serverId;

const server = await $fetch<serverWithChannels | undefined>(
  `/api/server2/${serverId}`
);

if (server?.channels?.[0]) {
  const initialChannel = server.channels[0];
  if (initialChannel?.name == "general") {
    router.push(`/servers/${serverId}/channels/${initialChannel?.id}`);
  }
}
</script>
<template></template>
