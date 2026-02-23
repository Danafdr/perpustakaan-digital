import emojiRegex from 'emoji-regex';
import { ReactNode } from 'react';

// Apple Emoji CDN (using jsdelivr for high availability)
// Using version 15.0.0 to support newer emojis
const APPLE_EMOJI_BASE_URL = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/img/apple/64/';

// Detect if the user is on an Apple device (Mac, iPhone, iPad)
const isAppleDevice = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');

/**
 * Converts a string containing emojis into an array of React elements
 * with emojis replaced by <img> tags using Apple style.
 * 
 * Optimization: Returns original text on Apple devices to use native system emojis.
 * 
 * @param text The text to render
 * @returns Array of ReactNodes (text strings and <img> elements) or original string
 */
export function renderWithAppleEmojis(text: string | null | undefined): ReactNode {
    if (!text) return text;

    // OPTIMIZATION: On Apple devices, native emojis ARE Apple emojis.
    // So we just render the text natively for better performance and text selection.
    if (isAppleDevice) {
        return text;
    }

    // Cast as any because emoji-regex types might be tricky with import
    const regex = (emojiRegex as any)();
    const result: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // We must loop through matches
    while ((match = regex.exec(text)) !== null) {
        const emoji = match[0];
        const index = match.index;

        // Add text before the emoji
        if (index > lastIndex) {
            result.push(text.substring(lastIndex, index));
        }

        // Convert match to hex code points
        // 1. Array.from splits by code point (handling surrogate pairs correctly)
        // 2. Map to hex
        // 3. Filter out ZWJ (200d) if needed? No, file names INCLUDE 200d.
        // 4. Join with dashes

        // Note: emoji-datasource-apple usually expects lowercase hex
        // It generally INCLUDES VS16 (fe0f) for fully qualified sequences, 
        // but some older integrations stripped it. 
        // We'll try to keep it as correct unicode.
        const hexCodes = (Array.from(emoji) as string[])
            .map((char) => char.codePointAt(0)?.toString(16))
            .filter(Boolean)
            .join('-');

        result.push(
            <img
                key={index}
                src={`${APPLE_EMOJI_BASE_URL}${hexCodes}.png`}
                alt={emoji}
                className="inline-block w-[1.25em] h-[1.25em] align-text-bottom mx-0.5 select-none pointer-events-none"
                draggable={false}
                onError={(e) => {
                    // Start of fallback logic
                    // If exact match fails, try stripping VS16 (fe0f) if present
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc.includes('-fe0f')) {
                        const newSrc = currentSrc.replace(/-fe0f/g, ''); // strip all fe0f
                        if (newSrc !== currentSrc) {
                            e.currentTarget.src = newSrc;
                            return;
                        }
                    }
                    // Final fallback: hide the image (broken link)
                    e.currentTarget.style.display = 'none';
                }}
            />
        );

        lastIndex = index + emoji.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    // Return simple array if we have replacements, otherwise original string
    // Wraps in a fragment-like structure implicity by returning array/node
    return result.length > 0 ? result : text;
}
