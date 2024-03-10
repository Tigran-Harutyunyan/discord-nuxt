import { defineStore } from "pinia";
import { io as ClientIO } from "socket.io-client";

export const useSocketStore = defineStore("socket", () => {
    const socket = ref(null);
    const isConnected = ref(false);

    const url = `${location.protocol === "https:" ? "wss://" : "ws://"}${location.host}`;

    const socketInstance = new (ClientIO as any)(url);

    socketInstance.on("connect", () => {
        isConnected.value = true
    });

    socketInstance.on("disconnect", () => {
        isConnected.value = false
    });

    socket.value = socketInstance;

    return {
        socket,
        isConnected
    };
});
