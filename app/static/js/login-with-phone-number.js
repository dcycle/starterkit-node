// login-with-phone-number.js

// DOM Elements
const generateTokenBtn = document.getElementById('generateTokenBtn');
const phoneNumberInput = document.getElementById('phoneNumber');
const tokenField = document.getElementById('tokenField');
const tokenInput = document.getElementById('tokenInput');
const submitBtn = document.getElementById('submitBtn');
const textFrameworkRadioButtons = document.getElementById('textframework-radio-buttons');
const errorMessage = document.getElementById('error-message');
const form = document.getElementById('phone-number-login-form');

// Fetch the dynamic text frameworks from the server and populate the radio buttons
function getTextFramework() {
  fetch('/textFramework/enabled-plugins')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Assuming the response is JSON
    })
    .then(data => {
      const container = document.getElementById("textframework-radio-buttons");
      
      // Loop through each plugin in the object and create a radio button for each
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const plugin = data[key];
          const radioContainer = document.createElement("div");
          const radioInput = document.createElement("input");
          const radioLabel = document.createElement("label");

          radioInput.type = "radio";
          radioInput.name = 'textframeworkSelected';
          radioInput.id = key;
          radioInput.value = key;
          radioInput.required = true; // Make this radio button required

          radioLabel.setAttribute("for", key);
          radioLabel.textContent = plugin.name;

          radioContainer.appendChild(radioInput);
          radioContainer.appendChild(radioLabel);
          container.appendChild(radioContainer);
        }
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

// Function to get the selected radio button value
function getSelectedRadioValue() {
  let selectedValue;

  // Get all the radio buttons with the name 'textframeworkSelected'
  const radios = document.querySelectorAll('input[name="textframeworkSelected"]');

  radios.forEach((radio) => {
    if (radio.checked) {
      selectedValue = radio.value;
    }
  });
  
  return selectedValue;
}

// Handle "Generate Token" button click
generateTokenBtn.addEventListener('click', async () => {
  const phoneNumber = phoneNumberInput.value.trim();
  const textframeworkSelected = getSelectedRadioValue();

  // Validate phone number
  if (!phoneNumber) {
    errorMessage.innerText = "Please enter a valid phone number.";
    errorMessage.style.display = "block";
    return;
  }

  if (!textframeworkSelected) {
    errorMessage.innerText = "Please select how do you want to receive a token.";
    errorMessage.style.display = "block";
    return;
  }

  // Make request to backend to generate and send the token
  try {
    const response = await fetch('/auth/phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, textframeworkSelected }),
    });

    console.log(response);
    const data = await response.json();
    console.log(data);

    if (data.success) {
      // Display the message to the user
      // "Kindly Enter the Login Token Sent through SMS."
      const message = data.message;
      errorMessage.innerText = message;
      errorMessage.style.display = "block";

      // Show the token input field after sending the token
      tokenField.style.display = "block";

      // Enable submit button if everything is ready
      enableSubmitButton();
    } else {
      errorMessage.innerText = "Failed to generate or send token. Kindly check your Phone number";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    errorMessage.innerText = "An error occurred while generating the token.";
    errorMessage.style.display = "block";
  }
});

// Enable the submit button once all validation conditions are met
function enableSubmitButton() {
  submitBtn.disabled = false;

  form.addEventListener('submit', function (event) {
    const token = tokenInput.value.trim();
    const textframeworkSelected = getSelectedRadioValue();
    const phoneNumber = phoneNumberInput.value.trim();

    // Check if token and selected framework are provided
    if (!token || !textframeworkSelected || !phoneNumber) {
      event.preventDefault();
      errorMessage.innerText = "Please fill in all required fields.";
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none"; // Hide error message if form is valid
    }
  });
}

// Run this function when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Fetch and populate dynamic options from server
  getTextFramework();
});

const urlParams = new URLSearchParams(window.location.search);
const info = urlParams.get('info');
if(info) {
  errorMessage.innerText = info;
  errorMessage.style.display = "block";
}
