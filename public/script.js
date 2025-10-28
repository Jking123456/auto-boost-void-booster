const form = document.getElementById('otpForm');
const phoneNumberInput = document.getElementById('phoneNumber');
const amountInput = document.getElementById('amount');
const messageArea = document.getElementById('messageArea');
const sendButton = document.getElementById('sendButton');

function displayMessage(type, message) {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };
  messageArea.innerHTML = `
    <div class="p-3 border rounded-lg text-sm ${colors[type]}">${message}</div>
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

form.addEventListener('submit', sendOTP);
