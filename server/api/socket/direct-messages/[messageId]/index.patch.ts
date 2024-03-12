import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const params = event.context.params;

    const { content } = await readBody(event);

    const { serverId, directMessageId, conversationId } = await getQuery(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }


    if (!directMessageId) {
        return createError({
            statusCode: 404,
            statusMessage: "Conversation ID missing"
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
                statusMessage: "Conversation ID missing"
            });
        }

        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        if (!member) {
            return createError({
                statusCode: 404,
                statusMessage: "Member not found"
            });
        }

        let directMessage = await db.directMessage.findFirst({
            where: {
                id: directMessageId as string,
                conversationId: conversationId as string,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        if (!directMessage || directMessage.deleted) {
            return createError({
                statusCode: 404,
                statusMessage: "Message not found"
            });
        }


        const isMessageOwner = directMessage.memberId === member.id;
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

        directMessage = await db.directMessage.update({
            where: {
                id: directMessageId as string,
            },
            data: {
                content,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })
        const updateKey = `chat:${conversation.id}:messages:update`;

        event.context?.appSocket.emit(updateKey, directMessage);

        return directMessage;
    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
