const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const plansPath = path.join(__dirname, 'data', 'plans.json');
const conversationPath = path.join(__dirname, 'data', 'conversation-flows.json');
const plans = JSON.parse(fs.readFileSync(plansPath, 'utf8'));
const conversationFlows = JSON.parse(fs.readFileSync(conversationPath, 'utf8'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mobile service chatbot is running.' });
});

app.get('/api/plans', (req, res) => {
  res.json(plans);
});

app.get('/api/conversation', (req, res) => {
  res.json(conversationFlows);
});

app.post('/api/plans', (req, res) => {
  const { preferredUse = '' } = req.body || {};
  const useText = preferredUse.toLowerCase();

  const rankedPlans = [...plans].sort((left, right) => {
    const leftScore = left.bestFor.reduce((score, tag) => {
      return useText.includes(tag) ? score + 2 : score;
    }, 0);
    const rightScore = right.bestFor.reduce((score, tag) => {
      return useText.includes(tag) ? score + 2 : score;
    }, 0);

    return rightScore - leftScore || right.price - left.price;
  });

  const candidates = rankedPlans.slice(0, 3);

  res.json({
    recommendedUse: preferredUse,
    plans: candidates,
    conversation: conversationFlows
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mobile service chatbot running on http://localhost:${PORT}`);
});
