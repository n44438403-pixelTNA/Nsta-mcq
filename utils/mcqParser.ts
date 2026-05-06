import { MCQItem } from '../types';

/**
 * Parses a raw text containing MCQ questions formatted with specific emojis and headers
 * into an array of MCQItem objects.
 *
 * Expected Format:
 * **Question X**
 * 📖 Topic: ...
 * ❓ Question: ...
 * Options:
 * A) ...
 * B) ...
 * C) ...
 * D) ...
 * ✅ Correct Answer: X) ...
 * 💡 Concept: ...
 * 🔎 Explanation: ...
 * 🎯 Exam Tip: ...
 * ⚠ Common Mistake: ...
 * 🧠 Memory Trick: ...
 * 📊 Difficulty Level: ...
 */
function extractStatements(questionText: string): { statements: string[], cleanedQuestion: string } {
    const statements: string[] = [];
    let cleanedQuestion = "";

    // We split by <br/> since the current parser converts \n to <br/> before this step
    const lines = questionText.split('<br/>');
    let inStatementBlock = false;
    let currentStatement = "";
    const tempQuestionLines: string[] = [];
    const endingQuestionLines: string[] = [];

    // Match patterns like "1.", "1)", "Statement 1:", "कथन 1:" at the start of the line
    const statementStartRegex = /^(?:Statement\s*\d+|कथन\s*\d+|\d+[\)\.])\s*[:\-\.]?(.*)/i;

    // Match common ending question phrases after statements
    const endingQuestionRegex = /^(?:which of the|उपर्युक्त|उपरोक्त|choose the|select the|find the|निम्नलिखित में से|कूट का|उपर्युक्त कथनों)/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (statementStartRegex.test(line)) {
            if (currentStatement) {
                statements.push(currentStatement.trim());
            }
            currentStatement = line;
            inStatementBlock = true;
        } else if (inStatementBlock) {
            // Check if this line looks like an ending question
            if (endingQuestionRegex.test(line) || (line.includes("?") || line.includes("सही है") || line.includes("गलत है"))) {
                if (currentStatement) {
                    statements.push(currentStatement.trim());
                    currentStatement = "";
                }
                inStatementBlock = false;
                endingQuestionLines.push(line);
            } else {
                // Continuation of the current statement
                currentStatement += " " + line;
            }
        } else {
            // We are not in a statement block
            if (statements.length > 0) {
                // If we already have statements, this must be an ending question
                endingQuestionLines.push(line);
            } else {
                // Otherwise it's the main question preamble
                tempQuestionLines.push(line);
            }
        }
    }

    if (currentStatement) {
        statements.push(currentStatement.trim());
    }

    cleanedQuestion = tempQuestionLines.join('<br/>');
    if (endingQuestionLines.length > 0) {
        // Add a visual separator or just append to the preamble
        cleanedQuestion += (cleanedQuestion ? "<br/><br/>" : "") + endingQuestionLines.join('<br/>');
    }

    return { statements, cleanedQuestion: cleanedQuestion || questionText };
}

export function parseMCQText(text: string): { questions: MCQItem[], notes: {title: string, content: string}[] } {
  const questions: MCQItem[] = [];
  const notes: {title: string, content: string}[] = [];

  // Use a regex that captures the question marker as well so we can split properly, but here we just split
  const blocks = text.split(/(?:\*\*Question \d+\*\*|Question \d+:?)/ig).filter(b => b.trim().length > 0);

  blocks.forEach(block => {
    let q: Partial<MCQItem> = {};

    // Extract PYQ Inspired
    const pyqMatch = block.match(/(?:🔥\s*)?PYQ Inspired:\s*(.+)/i);
    if (pyqMatch) q.pyqInspired = pyqMatch[1].trim();

    // Extract Topic (supports English/Hindi dual headings)
    const topicMatch = block.match(/(?:📖\s*)?(?:Topic|विषय).*?:\s*(.+)/i);
    if (topicMatch) q.topic = topicMatch[1].trim();

    // Identify if the block has A, B, C, D style options
    const hasAlphabetOptions = /(?:\n\s*[A-D][\)\.])/.test(block);

    // Extract Question text (multiline support before Options)
    let questionMatch = block.match(/(?:❓\s*)?(?:\*\*)?Question(?:\s*\(प्रश्न\))?:?(?:\*\*)?(?:\s*❓\s*Question:?)?\s*([\s\S]*?)(?=(?:Options(?:\s*\(विकल्प\))?:|विकल्प:))/i);
    if (!questionMatch) {
        if (hasAlphabetOptions) {
            questionMatch = block.match(/(?:❓\s*)?(?:\*\*)?Question(?:\s*\(प्रश्न\))?:?(?:\*\*)?(?:\s*❓\s*Question:?)?\s*([\s\S]*?)(?=(?:\n\s*[A-D][\)\.]))/i);
        } else {
            questionMatch = block.match(/(?:❓\s*)?(?:\*\*)?Question(?:\s*\(प्रश्न\))?:?(?:\*\*)?(?:\s*❓\s*Question:?)?\s*([\s\S]*?)(?=(?:\n\s*[1-4][\)\.]))/i);
        }
    }

    if (questionMatch) {
      q.question = questionMatch[1].trim();
      // Remove any leading numbers like "1. " or "Q1. " just in case they slipped in
      q.question = q.question.replace(/^(?:Q?\d+[\.\)\-]\s*)/i, '');
      // Format multiline questions with <br/> for proper rendering
      q.question = q.question.replace(/\n/g, '<br/>');

      // Multi-statement Extraction
      const statementData = extractStatements(q.question);
      if (statementData.statements.length > 0) {
          q.statements = statementData.statements;
          q.question = statementData.cleanedQuestion;
      }
    }

    // Extract Options
    // We look for block starting with "Options:" or just the options directly, ending at Correct Answer
    let optionsMatch = block.match(/(?:(?:Options(?:\s*\(विकल्प\))?:|विकल्प:)\s*)([\s\S]*?)(?=✅|(?:Correct Answer(?:\s*\(सही उत्तर\))?:))/i);
    if (!optionsMatch) {
        if (hasAlphabetOptions) {
            optionsMatch = block.match(/(?:\n\s*[A-D][\)\.])([\s\S]*?)(?=✅|(?:Correct Answer(?:\s*\(सही उत्तर\))?:))/i);
            if (optionsMatch) {
                optionsMatch[1] = block.match(/(?:\n\s*[A-D][\)\.])/i)![0] + optionsMatch[1];
            }
        } else {
            optionsMatch = block.match(/(?:\n\s*[1-4][\)\.])([\s\S]*?)(?=✅|(?:Correct Answer(?:\s*\(सही उत्तर\))?:))/i);
            if (optionsMatch) {
                optionsMatch[1] = block.match(/(?:\n\s*[1-4][\)\.])/i)![0] + optionsMatch[1];
            }
        }
    }

    if (optionsMatch) {
      const optionsText = optionsMatch[1].trim();
      // Only keep lines that look like valid options to filter out noise
      // We explicitly look for lines that strictly start with A/B/C/D or 1/2/3/4 to avoid capturing question text
      const optionLines = optionsText.split(/\n/).map(line => line.trim()).filter(line => /^(?:[A-D]|[1-4])[\)\.](?:\s|$)/i.test(line));

      if (optionLines.length >= 2) {
          // If we find exactly 4 letters, prefer them. If there's 1-4 mixed, standard processing.
          // In case of multiple lists (e.g. 1. 2. 3. in question and A B C D in options),
          // the question fix above should prevent them from being in optionsText.
          q.options = optionLines.map(opt => opt.replace(/^(?:[A-D]|[1-4])[\)\.]\s*/i, '').trim());
      }
    }

    // Extract Correct Answer
    // Look for explicit letter A) or A. or just text.
    const answerMatch = block.match(/(?:✅\s*)?(?:\*\*)?Correct Answer(?:\s*\(सही उत्तर\))?:?(?:\*\*)?(?:\s*✅\s*Correct Answer:?)?\s*([\s\S]*?)(?=💡|🔎|🎯|⚠|🧠|📊|Concept|Explanation|Exam Tip|Common Mistake|Memory Trick|Difficulty Level|$)/i);
    if (answerMatch) {
        const rawAns = answerMatch[1].trim();

        // 1. Try to extract a clean letter (A, B, C, D) from the start of the string
        const letterMatch = rawAns.match(/^([A-D])[\)\.]/i);
        if (letterMatch) {
            const letter = letterMatch[1].toUpperCase();
            q.correctAnswer = ['A', 'B', 'C', 'D'].indexOf(letter);
        } else if (q.options) {
            // 2. Fallback: try matching the text against options
            const ansTextClean = rawAns.replace(/^(?:[A-D])[\)\.]\s*/i, '').trim();
            const index = q.options.findIndex(opt => ansTextClean.includes(opt) || opt.includes(ansTextClean));
            if (index !== -1) {
                q.correctAnswer = index;
            }
        }
    }

    // Extract Concept
    const conceptMatch = block.match(/(?:💡\s*)?(?:\*\*)?Concept(?:\s*\(अवधारणा\))?:?(?:\*\*)?(?:\s*💡\s*Concept:?)?\s*([\s\S]*?)(?=🔎|🎯|⚠|🧠|📊|Explanation|Exam Tip|Common Mistake|Memory Trick|Difficulty Level|$)/i);
    if (conceptMatch) q.concept = conceptMatch[1].trim();

    // Extract Explanation
    const explanationMatch = block.match(/(?:🔎\s*)?(?:\*\*)?Explanation(?:\s*\(व्याख्या\))?:?(?:\*\*)?(?:\s*🔎\s*Explanation:?)?\s*([\s\S]*?)(?=🎯|⚠|🧠|📊|Exam Tip|Common Mistake|Memory Trick|Difficulty Level|$)/i);
    if (explanationMatch) q.explanation = explanationMatch[1].trim();

    // Extract Exam Tip
    const examTipMatch = block.match(/(?:🎯\s*)?(?:\*\*)?Exam Tip(?:\s*\(परीक्षा टिप\))?:?(?:\*\*)?(?:\s*🎯\s*Exam Tip:?)?\s*([\s\S]*?)(?=⚠|🧠|📊|Common Mistake|Memory Trick|Difficulty Level|$)/i);
    if (examTipMatch) q.examTip = examTipMatch[1].trim();

    // Extract Common Mistake
    const commonMistakeMatch = block.match(/(?:⚠\s*)?(?:\*\*)?Common Mistake(?:\s*\(सामान्य गलती\))?:?(?:\*\*)?(?:\s*⚠\s*Common Mistake:?)?\s*([\s\S]*?)(?=🧠|📊|Memory Trick|Difficulty Level|$)/i);
    if (commonMistakeMatch) q.commonMistake = commonMistakeMatch[1].trim();

    // Extract Memory Trick
    const memoryTrickMatch = block.match(/(?:🧠\s*)?(?:\*\*)?Memory Trick(?:\s*\(याद रखने का तरीका\))?:?(?:\*\*)?(?:\s*🧠\s*Memory Trick:?)?\s*([\s\S]*?)(?=📊|Difficulty Level|$)/i);
    if (memoryTrickMatch) q.mnemonic = memoryTrickMatch[1].trim();

    // Extract Difficulty
    const difficultyMatch = block.match(/(?:📊\s*)?(?:\*\*)?Difficulty Level(?:\s*\(कठिनाई\))?:?(?:\*\*)?(?:\s*📊\s*Difficulty Level:?)?\s*(?:[🔴🟢🟡]\s*)?(.+)/i);
    if (difficultyMatch) {
      const diffStr = difficultyMatch[1].trim().toLowerCase();
      if(diffStr.includes("easy")) q.difficultyLevel = "Easy";
      else if(diffStr.includes("medium")) q.difficultyLevel = "Medium";
      else if(diffStr.includes("hard")) q.difficultyLevel = "Hard";
      else q.difficultyLevel = diffStr; // fallback
    }

    // Extract remaining notes from the block
    let remainingNotesText = "";
    const lastMatch = difficultyMatch || memoryTrickMatch || commonMistakeMatch || examTipMatch || explanationMatch || conceptMatch || answerMatch;

    if (lastMatch && lastMatch.index !== undefined) {
      remainingNotesText = block.substring(lastMatch.index + lastMatch[0].length).trim();
    } else if (!q.question && block.length > 20) {
      // It's a pure note block with no questions
      remainingNotesText = block.trim();
    }

    // Parse deep notes vs quick notes if there's any text
    if (remainingNotesText.length > 20) {
      // Find where quick notes start
      const quickNotesRegex = /(?:❌\s*WHY WEAK|📌\s*KEY POINTS|🧠\s*1 LINE|⚡\s*EXAM HIT)/i;
      const match = remainingNotesText.match(quickNotesRegex);

      let deepNotePart = "";
      let quickNotePart = "";

      if (match && match.index !== undefined) {
          // Both deep and quick notes exist
          deepNotePart = remainingNotesText.substring(0, match.index).trim();
          quickNotePart = remainingNotesText.substring(match.index).trim();
      } else {
          // Only one type exists, determine which one
          if (quickNotesRegex.test(remainingNotesText)) {
              quickNotePart = remainingNotesText.trim();
          } else {
              deepNotePart = remainingNotesText.trim();
          }
      }

      if (deepNotePart) {
          q.deepNote = deepNotePart;

          // Add to general notes array so importer can pick it up
          const lines = deepNotePart.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length > 0) {
              const title = lines[0].substring(0, 50);
              notes.push({ title, content: deepNotePart });
          }
      }
      if (quickNotePart) q.quickNote = quickNotePart;

      // Legacy note field support
      q.note = remainingNotesText;
    }

    // Add if valid
    if (q.question && q.options && q.options.length > 0 && q.correctAnswer !== undefined) {
      questions.push(q as MCQItem);
    } else if (remainingNotesText.length > 20) {
      // If it doesn't look like a question at all, it might just be a note block
      const lines = remainingNotesText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length > 0) {
          const title = lines[0].substring(0, 50);
          notes.push({ title, content: remainingNotesText });
      }
    }
  });

  return { questions, notes };
}
