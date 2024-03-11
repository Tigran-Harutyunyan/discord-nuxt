import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    try {
        const channel = await db.channel.findUnique({
            where: {
                id: params?.channelId,
            },
        });

        return channel;
    } catch (error) {
        console.log("[CHANNEL_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});