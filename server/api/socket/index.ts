import { Server } from "socket.io";

export default defineEventHandler(async (event) => {


    try {




    } catch (error) {
        console.log("[MESSAGES]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
