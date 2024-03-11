import { findConversation, createNewConversation } from '@/lib/conversation';
export default defineEventHandler(async (event) => {

    const { auth } = event.context;

    const { memberOneId, memberTwoId, profileId } = await getQuery(event);

    if (!(auth?.userId)) return;

    if (!profileId) {
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        });
    }

    if (!(memberOneId && memberTwoId)) {
        return createError({
            statusCode: 401,
            statusMessage: "memberOneId or memberTwoId was not provided"
        });
    }

    try {
        let conversation = await findConversation(memberOneId as string, memberTwoId as string) || await findConversation(memberTwoId, memberOneId);

        if (!conversation) {
            conversation = await createNewConversation(memberOneId as string, memberTwoId as string);
        }

        return conversation;
    } catch (error) {
        console.log("[CONVERSATION]", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Error"
        });
    }

});