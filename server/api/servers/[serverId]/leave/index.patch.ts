import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default defineEventHandler(async (event) => {

  const { auth } = event.context;

  const params = event.context.params;

  if (!(auth?.userId)) return;

  const profile = await currentProfile(event);

  if (!profile) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }

  if (!params?.serverId) {
    return createError({
      statusCode: 400,
      statusMessage: "Server ID Missing"
    });
  }

  try {
    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id
        },
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id
          }
        }
      }
    });

    return server;
  } catch (error) {
    console.log("[SERVER_LEAVE]", error);
    return createError({
      statusCode: 500,
      statusMessage: "Internal Error"
    });
  }
});