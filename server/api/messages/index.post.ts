import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const { content, fileUrl, type, serverId } = await readBody(event);

    const { channelId } = await getQuery(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    if (!serverId) {
        return createError({
            statusCode: 400,
            statusMessage: "Server ID missing"
        });
    }

    if (!channelId) {
        return createError({
            statusCode: 400,
            statusMessage: "Channel ID missing"
        });
    }

    if (!content) {
        return createError({
            statusCode: 400,
            statusMessage: "Content  missing"
        });
    }

    try {
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true,
            }
        });

        if (!server) {
            return createError({
                statusCode: 400,
                statusMessage: "Server not found"
            });
        }

        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            }
        });

        if (!channel) {
            return createError({
                statusCode: 400,
                statusMessage: "Channel not found"
            });
        }

        const member = server.members.find((member) => member.profileId === profile.id);

        if (!member) {
            return createError({
                statusCode: 400,
                statusMessage: "Member not found"
            });
        }

        const message = await db.message.create({
            data: {
                content,
                fileUrl,
                channelId: channelId as string,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        });

        const channelKey = `chat:${channelId}:messages`;

        event.context?.appSocket.emit(channelKey, message);

        return message;
    } catch (error) {
        console.log("[MESSAGES]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
