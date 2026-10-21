# Mobile Service Chatbot

A lightweight Node.js/Express prototype that simulates a customer support chatbot for browsing mobile service plans, selecting a plan, and collecting signup details.

## Features

- Web-based chatbot interface
- Express backend to handle chat requests
- Sample mobile service plans: Basic, Standard, Premium
- Plan recommendation logic based on user preferences
- Guided signup flow with name, email, phone, and plan selection
- JSON-based plan catalog and conversation flows

## Local setup

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## Project structure

- `server.js` — Express server and conversation logic
- `data/plans.json` — plan catalog and pricing data
- `data/conversation-flows.json` — predefined welcome and signup flow messages
- `public/` — frontend HTML, CSS, and JavaScript assets
