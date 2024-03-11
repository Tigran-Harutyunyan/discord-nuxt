import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const { content } = await readBody(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }
    return content

    try {

    } catch (error) {
        console.log("[CHANNELS_POST]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
