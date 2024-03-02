import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const { name, imageUrl } = await readBody(event);

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        const server = await db.server.create({
            data: {
                profileId: profile.id,
                name,
                imageUrl,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                        { name: "general", profileId: profile.id }
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN }
                    ]
                }
            }
        });
        return server;
    } catch (error) {
        console.log("[SERVERS_POST]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }
});
