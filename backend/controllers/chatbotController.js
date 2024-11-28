const fs = require('fs');
const path = require('path');

// File path for chatbot data
const chatbotDataPath = path.join(__dirname, '../data/chatbotResponses.json');

// Function to read the chatbot data
const readChatbotData = () => {
  try {
    const data = fs.readFileSync(chatbotDataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading chatbot data:', err);
    return [];
  }
};

// Utility function to shuffle and select random items
const getRandomQuestions = (array, count) => {
  return array.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Placeholder for matchedQuestions (to simulate session-based storage for simplicity)
let matchedQuestions = [];

const getResponse = (req, res) => {
  const { query, selectedQuestionIndex } = req.body;

  // Case 1: Query provided
  if (query) {
    const lowerCaseQuery = query.trim().toLowerCase();
    const chatbotData = readChatbotData();

    // Find all matching questions (exact or partial match)
    matchedQuestions = chatbotData.filter(item =>
      item.question.toLowerCase().includes(lowerCaseQuery)
    );

    if (matchedQuestions.length === 0) {
      return res.json({ reply: 'No matching questions found. Please try again.' });
    }

    // Select up to 5 random questions from the matched ones
    const randomQuestions = getRandomQuestions(matchedQuestions, 5);

    return res.json({
      // reply: 'Please select a question from the following suggestions:'
      suggestions: randomQuestions.map((item, index) => ({
        id: item.id || index + 1, // Use item.id if available, otherwise index
        question: item.question,
      })),
    });
  }

  // Case 2: Selected question ID
  if (typeof selectedQuestionIndex === 'number') {
    const selectedQuestion = matchedQuestions.find(
      question => question.id === selectedQuestionIndex
    );

    if (!selectedQuestion) {
      return res.status(400).json({
        reply: 'Invalid question ID selected. Please select a valid question from the list.',
      });
    }

    const selectedAnswer = selectedQuestion.answer;

    if (selectedAnswer) {
      return res.json({
        reply: selectedAnswer,
      });
    }

    return res.status(400).json({ reply: 'Answer not found for the selected question.' });
  }

  // Default response
  return res.status(400).json({ reply: 'Query or question ID is required.' });
};

module.exports = { getResponse };