import { parseMCQText } from './utils/mcqParser';

const testText = `
**Question 1**
❓ Question: बिहार के आर्थिक पिछड़ेपन के मुख्य कारणों के संदर्भ में कौन सा युग्म सही सुमेलित है?
1. जनसंख्या का अत्यधिक दबाव - प्रति व्यक्ति भूमि की उपलब्धता में कमी।
2. कृषि पर निर्भरता - मानसून पर अत्यधिक भरोसा और बाढ़ की समस्या।
3. बुनियादी ढांचे का अभाव - बिजली, सड़क और परिवहन की कमी।

A) केवल 1 और 2
B) केवल 2 और 3
C) केवल 1 और 3
D) 1, 2 और 3

✅ Correct Answer: D) 1, 2 और 3
💡 Concept: This is a concept.
`;

const res = parseMCQText(testText);
console.log(JSON.stringify(res, null, 2));
