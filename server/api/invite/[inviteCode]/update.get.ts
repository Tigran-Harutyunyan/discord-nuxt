import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    const profile = await db.profile.findUnique({
        where: {
            userId: auth?.userId
        }
    });

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        const server = await db.server.update({
            where: {
                inviteCode: params?.inviteCode,
            },
            data: {
                members: {
                    create: [
                        {
                            profileId: profile.id,
                        }
                    ]
                }
            }
        });
        return server;
    } catch (error) {
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});