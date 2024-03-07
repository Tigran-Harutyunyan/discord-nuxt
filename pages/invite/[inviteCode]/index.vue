<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

const router = useRouter();

const route = useRoute();
const inviteCode = route.params?.inviteCode;

const updateServer = async () => {
  const server = await $fetch(`/api/invite/${inviteCode}/update`);

  if (server && typeof server === "object" && "id" in server) {
    router.push(`/servers/${server.id}`);
  }
};

const checkForExistingServer = async () => {
  const existingServer = await $fetch(`/api/invite/${inviteCode}/exists`);

  if (existingServer === "not_found") {
    toast({
      description: "Server not found",
      variant: "destructive",
      duration: 3000,
    });
    router.push("/");
  }

  if (
    existingServer &&
    typeof existingServer === "object" &&
    "id" in existingServer
  ) {
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
  <div>Checking...</div>
</template>
