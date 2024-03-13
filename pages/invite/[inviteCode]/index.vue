<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";
import { type Server } from "@prisma/client";

const { toast } = useToast();

const router = useRouter();

const route = useRoute();
const inviteCode = route.params?.inviteCode;

const updateServer = async () => {
  const server = await $fetch<Server | undefined>(
    `/api/invite/${inviteCode}/update`
  );

  if (server?.id) {
    router.push(`/servers/${server.id}`);
  }
};

const checkForExistingServer = async () => {
  const existingServer = await $fetch<Server | undefined | string>(
    `/api/invite/${inviteCode}/exists`
  );

  if (existingServer === "not_found") {
    toast({
      description: "Server not found",
      variant: "destructive",
      duration: 3000,
    });
    router.push("/");
  }

  if (typeof existingServer === "object" && "id" in existingServer) {
    router.push(`/servers/${existingServer.id}`);
    return;
  } else {
    updateServer();
  }
};

const profile = await $fetch("/api/profile");

if (!profile) {
  router.push("sign-in");
}

if (!route.params?.inviteCode) {
  router.push("/");
} else {
  checkForExistingServer();
}
</script>

<template>
  <div class="h-full p-4 space-y-2"><Loading /></div>
</template>
