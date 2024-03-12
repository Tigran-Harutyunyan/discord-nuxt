import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const { content, fileUrl, serverId } = await readBody(event);

    const { conversationId } = await getQuery(event);

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

    if (!content) {
        return createError({
            statusCode: 400,
            statusMessage: "Content  missing"
        });
    }

    try {
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id,
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id,
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true,
                    }
                },
                memberTwo: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        if (!conversation) {
            return createError({
                statusCode: 404,
                statusMessage: "Conversation not found"
            });
        }

        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo

        if (!member) {
            return createError({
                statusCode: 404,
                statusMessage: "Member not found"
            });
        }

        const message = await db.directMessage.create({
            data: {
                content,
                fileUrl,
                conversationId: conversationId as string,
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

        const channelKey = `chat:${conversationId}:messages`;

        event.context?.appSocket.emit(channelKey, message);

        return message;
    } catch (error) {
        console.log("[DIRECT_MESSAGES_POST]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
