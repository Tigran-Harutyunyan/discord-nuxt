<script setup lang="ts">
import InitialModal from "@/components/modals/InitialModal.vue";
const showDialog = ref(false);

const router = useRouter();

const response = await $fetch("/api/setup", {
  method: "GET",
});

if (typeof response === "boolean" && response === true) {
  showDialog.value = true;
}

if (response?.id) {
  router.push(`/servers/${response.id}`);
}

const onDone = () => {
  window.location.reload();
};
</script>

<template>
  <InitialModal
    @done="onDone"
    @close="showDialog = false"
    v-if="showDialog"
    :show="showDialog"
  />
</template>
