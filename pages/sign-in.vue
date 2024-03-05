<script setup lang="ts">
import { SignIn } from "vue-clerk";
useHead({
  title: "AI companion | Sign-in",
});
definePageMeta({
  middleware: ["public"],
  title: "Discord | Sign-in",
  layout: "auth",
});
</script>

<template>
  <div class="grid h-full place-items-center">
    <SignIn sign-up-url="/sign-up" />
  </div>
</template>
