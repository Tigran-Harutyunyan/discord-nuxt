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
        const existingServer = await db.server.findFirst({
            where: {
                inviteCode: params?.inviteCode,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            }
        });

        return existingServer;
    } catch (error) {
        if (error?.code === 'P2025') {
            return 'not_found'
        }
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});