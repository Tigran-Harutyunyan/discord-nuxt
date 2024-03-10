import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { type Message } from "@prisma/client";

export default defineEventHandler(async (event) => {
    const MESSAGES_BATCH = 10;

    const { cursor, channelId } = await getQuery(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 402,
            statusMessage: "Unauthorized"
        });
    }

    if (!channelId) {
        return createError({
            statusCode: 400,
            statusMessage: "Channel ID missing"
        });
    }

    let messages: Message[] = [];

    try {
        if (cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor as string,
                },
                where: {
                    channelId: channelId as string,
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
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId: channelId as string,
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
        console.log("[MESSAGES_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});
