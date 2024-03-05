import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        const servers = await db.server.findMany({
            where: { members: { some: { profileId: profile.id } } },
        });

        return servers;
    } catch (error) {
        console.log("[SERVERS_POST]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});