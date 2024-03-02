import { db } from "@/lib/db";

export const currentProfile = async (event) => {
  const { auth } = event.context;
  const userId = auth?.userId;

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId
    }
  });

  return profile;
}