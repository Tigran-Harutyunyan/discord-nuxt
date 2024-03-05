<script setup lang="ts">
import { SignUp } from "vue-clerk";
useHead({
  title: "AI companion | Sign up",
});
definePageMeta({
  layout: "auth",
  middleware: ["public"],
  title: "Discord | Sign-up",
});
</script>

<template>
  <div class="grid h-full place-items-center">
    <SignUp sign-in-url="/sign-in" />
  </div>
</template>
