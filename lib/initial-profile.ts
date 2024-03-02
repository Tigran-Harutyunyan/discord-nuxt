import { clerkClient } from "h3-clerk";

import { db } from "@/lib/db";

export const initialProfile = async (event) => {
  const { auth } = event.context;

  const userId = auth.userId;

  if (!userId) {
    setResponseStatus(event, 403)
    return ''
  }

  const user = await clerkClient.users.getUser(userId);

  if (!user) {
    return navigateTo('/sign-in')
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id
    }
  });

  if (profile) {
    return profile;
  }

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress
    }
  });

  return newProfile;
};
