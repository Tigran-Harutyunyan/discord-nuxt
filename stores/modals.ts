import { defineStore } from "pinia";
import { type Channel, ChannelType, type Server, type Member, type Profile, MemberRole } from "@prisma/client";

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
    const updateMessageCounter = ref(0); // for triggering purposes.

    function onOpen(t: ModalType | null, d = {}) {
        isOpen.value = true;
        type.value = t;
        data.value = d
    }

    function onClose() {
        type.value = null;
        isOpen.value = false;
    }

    function onMemberRoleChange(memberId: string, role: MemberRole) {
        if (data.value?.server?.members) {
            data.value?.server?.members.forEach(member => {
                if (member.id === memberId) member.role = role;
            });
        }

        updateMessageCounter.value++;
    }

    function triggerUpdateMessage() {
        updateMessageCounter.value++;
    }

    return {
        isOpen,
        type,
        data,
        updateMessageCounter,
        onOpen,
        onClose,
        onMemberRoleChange,
        triggerUpdateMessage
    };
});
