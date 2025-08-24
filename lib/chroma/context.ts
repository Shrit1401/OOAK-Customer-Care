import { summarizeText } from "../ai/chat.server";
import { getContextUser } from "../db/message.server";

export async function getContext(
    k: number = 10,
    phoneNumber: string
) {
    try {
        const {users, posts, importants, categories, comments} = await getContextUser(phoneNumber);

        // Combine all context data into a single array
        const allContext = [
            ...users.map((user: any) => `User: ${JSON.stringify(user)}`),
            ...posts.map((post: any) => `Post: ${JSON.stringify(post)}`),
            ...importants.map((important: any) => `Important: ${JSON.stringify(important)}`),
            ...categories.map((category: any) => `Category: ${JSON.stringify(category)}`),
            ...comments.map((comment: any) => `Comment: ${JSON.stringify(comment)}`)
        ];

        // Slice to k items
        const slicedContext = allContext.slice(0, k);
        
        // Second half - summarize
        const secondHalf = allContext.slice(k, allContext.length - 1);
        let summarizedSecondHalf: string[] = [];
        
        if (secondHalf.length > 0) {
            const secondHalfText = secondHalf.join('\n');
            const summary = await summarizeText(secondHalfText);
            summarizedSecondHalf = [summary];
        }
        
        // Combine first half and summarized second half
        const result = [...slicedContext, ...summarizedSecondHalf];
        
        return result;

    } catch (error) {
        console.error("Failed to get context", error);
        return [];
    }
}