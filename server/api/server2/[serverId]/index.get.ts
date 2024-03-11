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
        const server = await db.server.findUnique({
            where: {
                id: params?.serverId,
                members: {
                    some: {
                        profileId: profile.id,
                    }
                }
            },
            include: {
                channels: {
                    where: {
                        name: "general"
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        })

        return server;
    } catch (error) {
        console.log("[SERVER_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});