1. Modify `parseMCQText` in `utils/mcqParser.ts`:
   Instead of just splitting by `Question X` and discarding the rest, we can process the blocks. If a block doesn't look like an MCQ (e.g. no Options, no Correct Answer), it might be a Note.
   Or even better, we can identify text that exists *before* a Question block starts, or trailing text.
   Actually, `text.split(/(?:\*\*Question \d+\*\*|Question \d+:?)/g)` splits the text, and the first element is everything *before* Question 1. Subsequent elements are the questions. But what if a note is inserted *between* Question 4 and Question 5? The note will be at the end of the Question 4 block!

   If we look at a block, it contains the question, options, answer, etc. Anything after the `Difficulty Level` (or the last property of the question) is just extra text. This extra text is exactly the Note!

   So, in `parseMCQText`:
   - After parsing all fields of an MCQ, find the end index of the question's content.
   - Whatever remains in the block is a `note`.
   - Wait, we need to return both MCQs and Notes from `parseMCQText`.
   - Update the signature: `export function parseMCQText(text: string): { questions: MCQItem[], notes: {title: string, content: string}[] }`
   - Fix the callers in `AdminDashboard.tsx` and `ChallengeCreator20.tsx`.
