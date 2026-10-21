const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

const state = {
  step: 'greeting',
  user: {
    name: '',
    email: '',
    phone: '',
    preferredUse: '',
    planId: ''
  }
};

let conversation = null;

const profileQuestions = [
  { key: 'name', label: 'What is your full name?' },
  { key: 'email', label: 'What is your email address?' },
  { key: 'phone', label: 'What is your phone number?' }
];

async function loadConversation() {
  try {
    const response = await fetch('/api/conversation');
    conversation = await response.json();
  } catch (error) {
    conversation = {
      welcomeMessage: 'Hi! I can help you find the right mobile service plan. What kind of mobile use do you need most: streaming, business work, family use, or a budget-friendly option?',
      planSelectionPrompt: 'Reply with the name of the plan you want to choose (Basic, Standard, or Premium).',
      fallbackPrompt: 'Please choose one of the plans: Basic, Standard, or Premium.',
      signupQuestionSequence: [
        'What is your full name?',
        'What is your email address?',
        'What is your phone number?'
      ]
    };
  }
}

function addMessage(text, sender = 'bot') {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendPlanCards(plans) {
  const wrapper = document.createElement('div');
  wrapper.className = 'plan-card';
  wrapper.innerHTML = `
    <h3>Recommended plans</h3>
    <div class="plan-meta">Choose the option that best matches your needs.</div>
    ${plans
      .map(
        (plan) => `
          <div class="plan-card">
            <h3>${plan.name} — $${plan.price}/month</h3>
            <div class="plan-meta">${plan.data} data • ${plan.calls} • ${plan.sms}</div>
            <p>${plan.description}</p>
            <ul>
              <li>Best for: ${plan.bestFor.join(', ')}</li>
              <li>Price: $${plan.price}/month</li>
            </ul>
          </div>
        `
      )
      .join('')}
  `;
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getPlansForPreference(preferredUse) {
  const response = await fetch('/api/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferredUse })
  });

  return response.json();
}

async function handleBotReply(rawMessage) {
  const text = rawMessage.trim();

  if (!text) {
    return;
  }

  if (state.step === 'greeting') {
    state.user.preferredUse = text;
    const result = await getPlansForPreference(text);
    state.step = 'plan-selection';

    addMessage('Thanks! Based on your needs, here are a few mobile plans that might fit:', 'bot');
    appendPlanCards(result.plans);
    addMessage(conversation?.planSelectionPrompt || 'Reply with the name of the plan you want to choose (Basic, Standard, or Premium).', 'bot');
    return;
  }

  if (state.step === 'plan-selection') {
    const normalized = text.toLowerCase();
    const match = ['basic', 'standard', 'premium'].find((plan) =>
      normalized.includes(plan)
    );

    if (!match) {
      addMessage(conversation?.fallbackPrompt || 'Please choose one of the plans: Basic, Standard, or Premium.', 'bot');
      return;
    }

    state.user.planId = match;
    state.step = 'collecting-profile';
    addMessage(
      `Great choice! ${match[0].toUpperCase() + match.slice(1)} is an excellent fit. ${profileQuestions[0].label}`,
      'bot'
    );
    return;
  }

  if (state.step === 'collecting-profile') {
    const currentQuestion = profileQuestions.find((q) => !state.user[q.key]);
    const key = currentQuestion ? currentQuestion.key : null;

    if (!key) {
      addMessage('Thank you! Your information has been captured. We are ready to finalize your signup.', 'bot');
      state.step = 'complete';
      return;
    }

    state.user[key] = text;
    const nextIndex = profileQuestions.findIndex((q) => q.key === key) + 1;

    if (nextIndex < profileQuestions.length) {
      addMessage(profileQuestions[nextIndex].label, 'bot');
    } else {
      addMessage(
        `Thanks, ${state.user.name}! Your signup request for the ${state.user.planId[0].toUpperCase() + state.user.planId.slice(1)} plan is ready. We will contact you at ${state.user.email} or ${state.user.phone}.`,
        'bot'
      );
      state.step = 'complete';
    }
    return;
  }

  addMessage('Your plan signup has already been captured. Please refresh to start a new conversation.', 'bot');
}

async function setupChat() {
  await loadConversation();
  addMessage(conversation?.welcomeMessage || 'Hi! I can help you find the right mobile service plan. What kind of mobile use do you need most: streaming, business work, family use, or a budget-friendly option?', 'bot');

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = messageInput.value.trim();
    if (!value) {
      return;
    }

    addMessage(value, 'user');
    messageInput.value = '';
    await handleBotReply(value);
  });
}

setupChat();
