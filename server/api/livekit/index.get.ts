import { currentProfile } from "@/lib/current-profile";
import { AccessToken } from 'livekit-server-sdk';

export default defineEventHandler(async (event) => {
    const { auth } = event.context;

    if (!(auth?.userId)) return;

    const profile = await currentProfile(event);

    if (!profile) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    try {
        // if this room doesn't exist, it'll be automatically created when the first
        // client joins
        const roomName = 'quickstart-room';
        // identifier to be used for participant.
        // it's available as LocalParticipant.identity with livekit-client SDK
        const participantName = 'quickstart-username';

        const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
            identity: participantName,
            // token to expire after 10 minutes
            ttl: '10m',
        });
        at.addGrant({ roomJoin: true, room: roomName });

        return await at.toJwt();
    } catch (error) {
        console.log("[LIVEKIT_GET]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});