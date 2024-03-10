import { useSocketStore } from "@/stores/socket";

import { useQueryClient } from "@tanstack/vue-query";
import type { Member, Message, Profile } from "@prisma/client";

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    }
}

export const useChatSocket = ({
    addKey,
    updateKey,
    queryKey
}: ChatSocketProps) => {

    const { isConnected, socket } = storeToRefs(useSocketStore());
    const queryClient = useQueryClient();

    const updateFn = (message: MessageWithMemberWithProfile) => {
        console.log(updateKey, message)
        queryClient.setQueryData([queryKey], (oldData: any) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                return oldData;
            }

            const newData = oldData.pages.map((page: any) => {
                return {
                    ...page,
                    items: page.items.map((item: MessageWithMemberWithProfile) => {
                        if (item.id === message.id) {
                            return message;
                        }
                        return item;
                    })
                }
            });


            return {
                ...oldData,
                pages: newData,
            }
        })
    }

    const addFn = (message: MessageWithMemberWithProfile) => {
        console.log(addKey, message);

        queryClient.setQueryData([queryKey], (oldData: any) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                return {
                    pages: [{
                        items: [message],
                    }]
                }
            }

            const newData = [...oldData.pages];

            newData[0] = {
                ...newData[0],
                items: [
                    message,
                    ...newData[0].items,
                ]
            };
            console.log(oldData, newData)
            return {
                ...oldData,
                pages: newData,
            };
        })

    }
    onMounted(() => {
        if (!socket.value) return;

        socket.value.on(updateKey, updateFn);

        socket.value.on(addKey, addFn);
    });

    onUnmounted(() => {
        if (!socket.value) return;
        console.log('unmounted')
        socket.value?.off(addKey, addFn);
        socket.value?.off(updateKey, updateFn);
    })
}