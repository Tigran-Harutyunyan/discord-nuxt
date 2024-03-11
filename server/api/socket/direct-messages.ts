import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const { content, type } = await readBody(event);

    console.log(type)

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        event.context?.appSocket.emit('message', 'Love')
    } catch (error) {
        console.log("[DIRECT_MESSAGES]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
