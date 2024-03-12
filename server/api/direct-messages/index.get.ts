import { currentProfile } from "@/lib/current-profile";
import { DirectMessage } from "@prisma/client";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    try {
        const profile = await currentProfile(event);

        if (!profile) {
            return createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        const params = await getQuery(event);

        if (!params.conversationId) {
            return createError({
                statusCode: 400,
                statusMessage: "Conversation ID missing"
            });
        }

        let messages: DirectMessage[] = [];
        if (params.cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: params.cursor as string,
                },
                where: {
                    conversationId: params.conversationId as string,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                }
            })
        } else {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                where: {
                    conversationId: params.conversationId as string,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                }
            });
        }

        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        return {
            items: messages,
            nextCursor
        };

    } catch (error) {
        console.log("[DIRECT_MESSAGES_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
