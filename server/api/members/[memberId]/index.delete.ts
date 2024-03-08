import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const params = event.context.params;

    if (!(auth?.userId)) return;

    const { serverId } = await getQuery(event);

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

    if (!params?.memberId) {
        return createError({
            statusCode: 400,
            statusMessage: "Member ID missing"
        });
    }

    try {

        const server = await db.server.update({
            where: {
                id: serverId as string,
                profileId: profile.id,
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    }
                },
            },
        });
        return server;
    } catch (error) {
        console.log("[MEMBERS_ID_DELETE]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
