import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const params = event.context.params;

    const { serverId, channelId } = await getQuery(event);

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

    try {
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id,
                    }
                }
            },
            include: {
                members: true,
            }
        })

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
            },
        });

        if (!channel) {
            return createError({
                statusCode: 404,
                statusMessage: "Channel not found"
            });
        }

        const member = server.members.find((member) => member.profileId === profile.id);

        if (!member) {
            return createError({
                statusCode: 404,
                statusMessage: "Member not found"
            });
        }

        let message = await db.message.findFirst({
            where: {
                id: params?.messageId as string,
                channelId: channelId as string,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        if (!message || message.deleted) {
            return createError({
                statusCode: 404,
                statusMessage: "Message not found"
            });
        }

        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) {
            return createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        if (!isMessageOwner) {
            return createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        message = await db.message.update({
            where: {
                id: params?.messageId as string,
            },
            data: {
                fileUrl: null,
                content: "This message has been deleted.",
                deleted: true,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        const updateKey = `chat:${channelId}:messages:update`;

        event.context?.appSocket.emit(updateKey, message);

        return message
    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
