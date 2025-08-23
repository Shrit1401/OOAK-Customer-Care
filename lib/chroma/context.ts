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
            ...users.map(user => `User: ${JSON.stringify(user)}`),
            ...posts.map(post => `Post: ${JSON.stringify(post)}`),
            ...importants.map(important => `Important: ${JSON.stringify(important)}`),
            ...categories.map(category => `Category: ${JSON.stringify(category)}`),
            ...comments.map(comment => `Comment: ${JSON.stringify(comment)}`)
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