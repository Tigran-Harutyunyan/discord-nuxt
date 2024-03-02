import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";

export default defineEventHandler(async (event) => {
  const profile = await initialProfile(event);

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (server) {
    return server
  }

  return true;

});
