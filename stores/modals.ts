import { defineStore } from "pinia";
import { type Channel, ChannelType, type Server } from "@prisma/client";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage";

interface ModalData {
    server?: Server;
    channel?: Channel;
    channelType?: ChannelType;
    apiUrl?: string;
    query?: Record<string, any>;
}

export const useModalsStore = defineStore("modals", () => {
    const type = ref<ModalType | null>(null);
    const data = ref<ModalData>({});
    const isOpen = ref(false);

    function onOpen(t: ModalType | null, d = {}) {
        isOpen.value = true;
        type.value = t;
        data.value = d
    }

    function onClose() {
        type.value = null;
        isOpen.value = false;
    }

    return {
        isOpen,
        type,
        data,
        onOpen,
        onClose,
    };
});
