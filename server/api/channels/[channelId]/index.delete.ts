import { MemberRole } from "@prisma/client";
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

    const { serverId } = await getQuery(event);

    if (!serverId) {
        return createError({
            statusCode: 400,
            statusMessage: "Server ID missing"
        });
    }

    if (!params?.channelId) {
        return createError({
            statusCode: 400,
            statusMessage: "Channel ID missing"
        });
    }

    try {
        const server = await db.server.update({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                        }
                    }
                }
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general",
                        }
                    }
                }
            },
            include: {
                channels: true,
            }
        });
        return server;
    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
