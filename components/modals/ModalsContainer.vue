<script setup lang="ts">
import { useModalsStore } from "@/stores/modals";

const { type } = storeToRefs(useModalsStore());

import InviteModal from "@/components/modals/InviteModal.vue";
import EditServerModal from "@/components/modals/EditServerModal.vue";
// import { CreateServerModal } from "@/components/modals/create-server-modal";
import MembersModal from "@/components/modals/MembersModal.vue";
import CreateChannelModal from "@/components/modals/CreateChannelModal.vue";
import LeaveServerModal from "@/components/modals/LeaveServerModal.vue";
import DeleteServerModal from "@/components/modals/DeleteServerModal.vue";
import DeleteChannelModal from "@/components/modals/DeleteChannelModal.vue";
import EditChannelModal from "@/components/modals/EditChannelModal.vue";
import MessageFileModal from "@/components/modals/MessageFileModal.vue";
import DeleteMessageModal from "@/components/modals/DeleteMessageModal.vue";

const computedComponent = computed(() => {
  if (type.value !== null) {
    switch (type.value) {
      case "invite":
        return InviteModal;
      case "deleteChannel":
        return DeleteChannelModal;
      case "members":
        return MembersModal;
      case "deleteServer":
        return DeleteServerModal;
      case "editServer":
        return EditServerModal;
      case "leaveServer":
        return LeaveServerModal;
      case "createChannel":
        return CreateChannelModal;
      case "editChannel":
        return EditChannelModal;
      case "deleteMessage":
        return DeleteMessageModal;
      case "messageFile":
        return MessageFileModal;
    }
  }

  return null;
});
</script>

<template>
  <component :is="computedComponent" />
</template>
