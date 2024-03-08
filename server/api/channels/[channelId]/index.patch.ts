import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    const { name, type } = await readBody(event);

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

    if (name === "general") {
        return createError({
            statusCode: 400,
            statusMessage: "Name cannot be 'general"
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
                    update: {
                        where: {
                            id: params.channelId,
                            NOT: {
                                name: "general",
                            },
                        },
                        data: {
                            name,
                            type,
                        }
                    }
                }
            },
            include: {
                channels: true,
            }
        });
        server.channels.forEach((element, index, arr) => {
            if (element.id === params?.channelId) {
                arr[index].name = name;
                arr[index].type = type;
            }
        });
        return server;
    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
