<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import NavigationSidebar from "@/components/navigation/NavigationSidebar.vue";
import ServerSidebar from "@/components/server/ServerSidebar.vue";
</script>

<template>
  <Sheet>
    <SheetTrigger>
      <Button variant="ghost" size="icon" class="md:hidden">
        <Menu />
      </Button>
    </SheetTrigger>
    <SheetContent side="left" class="p-0 flex gap-0">
      <div class="w-[72px]">
        <NavigationSidebar />
      </div>
      <ServerSidebar class="pr-8" />
    </SheetContent>
  </Sheet>
</template>
