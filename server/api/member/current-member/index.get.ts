import { db } from "@/lib/db";
export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const { profileId, serverId } = await getQuery(event);

    if (!(auth?.userId)) return;

    if (!profileId) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    if (!serverId) {
        return createError({
            statusCode: 401,
            statusMessage: "Server ID is missing"
        });
    }


    try {

        const currentMember = await db.member.findFirst({
            where: {
                serverId: serverId as string,
                profileId: profileId as string,
            },
            include: {
                profile: true,
            },
        });

        return currentMember;
    } catch (error) {
        console.log("[CURRENT_MEMBER_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});