import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    const { name, imageUrl } = await readBody(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        const server = await db.server.update({
            where: {
                id: params?.serverId,
                profileId: profile.id,
            },
            data: {
                name,
                imageUrl,
            }
        });
        return server;
    } catch (error) {
        console.log("[SERVER_PATCH]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
