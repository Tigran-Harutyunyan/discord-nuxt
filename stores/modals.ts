import { defineStore } from "pinia";
import { type Channel, ChannelType, type Server, type Member, type Profile } from "@prisma/client";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage";

type serverMember = Member & {
    profile: Profile
}

interface ModalData {
    server?: Server & { members?: serverMember[], channels?: Channel[] };
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

    function onSaveServerChanges(payload: { name: string, imageUrl: string }) {
        if (data.value?.server) {
            data.value.server.name = payload.name;
            data.value.server.imageUrl = payload.imageUrl;
        }
    }

    function onUpdateChannels(channels: Channel[]) {
        if (data.value?.server) {
            if (!data.value?.server?.channels) {
                data.value.server.channels = [];
            }

            data.value.server.channels = channels;
        }
    }

    return {
        isOpen,
        type,
        data,
        onOpen,
        onClose,
        onSaveServerChanges,
        onUpdateChannels
    };
});
