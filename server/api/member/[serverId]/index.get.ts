import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        const member = await db.member.findFirst({
            where: {
                serverId: params?.serverId,
                profileId: profile.id,
            }
        });

        return member;
    } catch (error) {
        console.log("[MEMBER_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});