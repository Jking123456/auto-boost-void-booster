const form = document.getElementById('otpForm');
const phoneNumberInput = document.getElementById('phoneNumber');
const amountInput = document.getElementById('amount');
const messageArea = document.getElementById('messageArea');
const sendButton = document.getElementById('sendButton');
const statsContent = document.getElementById('statsContent');
const refreshBtn = document.getElementById('refreshStats');

function displayMessage(type, message) {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };
  messageArea.innerHTML = `
    <div class="p-3 border rounded-lg text-sm ${colors[type]} animate-fadeIn">${message}</div>
  `;
}

async function sendOTP(event) {
  event.preventDefault();

  const phoneNumber = phoneNumberInput.value.trim();
  const amount = parseInt(amountInput.value.trim(), 10);

  if (!phoneNumber || phoneNumber.length < 10) {
    displayMessage('error', 'Please enter a valid phone number.');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    displayMessage('error', 'Please enter a valid amount.');
    return;
  }

  sendButton.disabled = true;
  sendButton.innerHTML = 'Sending...';
  displayMessage('info', 'Sending SMS...');

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, amount }),
    });

    const result = await response.json();

    if (response.ok) {
      displayMessage('success', `✅ SMS sent successfully! Message: ${result.message || 'Success'}`);
      fetchStats();
    } else {
      displayMessage('error', result.message || 'Failed to send SMS.');
    }
  } catch (err) {
    console.error(err);
    displayMessage('error', 'Network error. Please try again.');
  } finally {
    sendButton.disabled = false;
    sendButton.innerHTML = 'Send SMS';
  }
}

async function fetchStats() {
  statsContent.innerHTML = '<p class="text-gray-400 italic">Fetching stats...</p>';
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();

    if (!response.ok || !data.success) {
      statsContent.innerHTML = `<p class="text-red-600">Failed to load stats.</p>`;
      return;
    }

    const { totalRequests, endpoints, lastUpdated } = data.data;
    const updatedDate = new Date(lastUpdated).toLocaleString();

    const endpointGrid = Object.entries(endpoints)
      .map(([name, count]) => `
        <div class="flex justify-between border-b border-gray-100 py-2">
          <span class="text-gray-600">${name}</span>
          <span class="font-semibold text-indigo-700">${count}</span>
        </div>
      `).join('');

    statsContent.innerHTML = `
      <div class="space-y-3 animate-fadeIn">
        <p class="font-medium text-lg text-gray-700">Total Requests: <span class="font-bold text-indigo-600">${totalRequests}</span></p>
        <div class="text-left divide-y divide-gray-100">${endpointGrid}</div>
        <p class="text-xs text-gray-400 mt-2">Last Updated: ${updatedDate}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
    statsContent.innerHTML = `<p class="text-red-600">Error loading stats.</p>`;
  }
}

// Small fade animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
  .animate-fadeIn { animation: fadeIn 0.4s ease-in-out; }
`;
document.head.appendChild(style);

form.addEventListener('submit', sendOTP);
refreshBtn.addEventListener('click', fetchStats);
window.addEventListener('DOMContentLoaded', fetchStats);
