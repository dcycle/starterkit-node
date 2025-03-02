// DOM Elements
// Button to generate token
const generateTokenBtn = document.getElementById('generate-token-btn');
// Message area for displaying token info
const tokenMessage = document.getElementById('token-status-message');
// Button to trigger merge modal
const mergeAccountBtn = document.getElementById('merge-account-btn');
// Message area for displaying error
const errorMessage = document.getElementById('error-message');
// Input field for entering token
const tokenInput = document.getElementById('merge-token-input');
// Message area for displaying merge status
const mergeMessage = document.getElementById('merge-status-message');

/**
 * Handle the "Generate Token" button click event.
 * When clicked, it fetches a token from the server and displays it in the message area.
 */
generateTokenBtn.addEventListener('click', async () => {
  try {
    // Send a GET request to generate a token
    const response = await fetch('/account/merge/generate-token', {
      method: 'GET',
    });
    
    // If the response status is 200 (success), handle the token
    if (response.status == 200) {
      const data = await response.json();  // Parse the response JSON
      if (data.token) {
        // If a token is returned, display the token along with the message
        const message = data.message;
        const token = data.token;
        tokenMessage.innerText = token + ' ' + message;
      } else {
        // If no token is returned, display the message from the response
        const message = data.message;
        tokenMessage.innerText = message;
      }
    } else {
      // If the response status is not 200, show an error message
      errorMessage.innerText = 'Failed to generate or send token. Kindly check your Phone number';
    }
  } catch (error) {
    // If there is any error in fetching the token, display an error message
    errorMessage.innerText = 'An error occurred while generating the token.';
  }
});

/**
 * Function to show the modal for merging accounts.
 * This modal asks the user if they are sure they want to merge the account.
 */
function showMergeModal() {
  // The message displayed in the modal
  const modalMessage = document.getElementById('modal-message');
  // The confirm button in the modal
  const confirmButton = document.getElementById('confirm-btn');

  // Set the modal message and button text based on the merge operation
  modalMessage.textContent = 'Are you sure you want to merge this account?';
  confirmButton.textContent = 'Yes, Merge';
  // Change button color to green for merge
  confirmButton.classList.remove('btn-danger');
  // Green for merge
  confirmButton.classList.add('btn-success');

  // Show the modal (make it visible)
  document.getElementById('confirmation-modal').style.display = 'block';

  // Set up the button's action for merging
  confirmButton.onclick = function() {
    // After clicking the "Yes, Merge" button, hide the modal
    hideModal();

    // Get the token from the input field
    const token = tokenInput.value.trim();

    // Send the token to the server to initiate the merge process
    fetch('/account/merge/token-submit', {
      method: 'POST',
      body: JSON.stringify({ token: token }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => response.json())  // Parse the response as JSON
    .then((data) => {
      // Update the merge status message
      mergeMessage.innerText = data.message;
      if (data.status) {
        // If merge is successful, display the merged accounts
        $("#merged-accounts").empty();
        let ul = $("<ul></ul>");
        data.accounts.forEach((account) => {
          let li = $("<li></li>").text('* ' + account.username);
          ul.append(li);
        });

        // Display the merged accounts
        $("#merged-accounts").append("<p>Your account is a merger of the following accounts:</p>");
        $("#merged-accounts p").append(ul);
        // show the "Un Merge" button after a successful merge
        const unmergeBtn = document.getElementById('unmerge-account-btn');
        // Display the button as a block element
        unmergeBtn.style.display = 'block';
        // clear token from textbox
        $("#merge-token-input").val("");
      }
    }).catch((error) => {
      // Handle any errors during the merge process
      console.error('Error merging accounts:', error);
      mergeMessage.innerText = 'Failed to merge accounts';
    });
  };
}

/**
 * Function to show the modal for unmerging accounts.
 * This modal asks the user if they are sure they want to unmerge the account.
 */
function showUnmergeModal() {
  // The message displayed in the modal
  const modalMessage = document.getElementById('modal-message');
  // The confirm button in the modal
  const confirmButton = document.getElementById('confirm-btn');

  // Set the modal message and button text based on the unmerge operation
  modalMessage.textContent = 'Are you sure you want to unmerge this account?';
  confirmButton.textContent = 'Yes, Unmerge';
  // Change button color to red for unmerge
  confirmButton.classList.remove('btn-success');
  // Red for unmerge
  confirmButton.classList.add('btn-danger');

  // Show the modal (make it visible)
  document.getElementById('confirmation-modal').style.display = 'block';

  // Set up the button's action for unmerging
  confirmButton.onclick = function() {
    // After clicking the "Yes, Unmerge" button, hide the modal
    console.log("Unmerging account...");
    hideModal();

    // Send the unmerge request to the server
    fetch('/account/unmerge', {
      method: 'GET',
    }).then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // Update the merge status message with the server response
      mergeMessage.innerText = data.message;
      console.log(data);

      // If unmerge is successful, clear the merged accounts section
      if (data.status) {
        $("#merged-accounts").empty();
        // hide the "Un Merge" button after a unmerging this account
        const unmergeBtn = document.getElementById('unmerge-account-btn');
        // Hide the button
        unmergeBtn.style.display = 'none';
      }
    }).catch((error) => {
      // Handle any errors during the unmerge process
      console.error('Error unmerging accounts:', error);
      mergeMessage.innerText = 'Failed to unmerge accounts';
    });
  };
}

/**
 * Function to hide the modal when the user clicks "Cancel" or after an action is completed.
 */
function hideModal() {
  // Hide the modal
  document.getElementById('confirmation-modal').style.display = 'none';
}

/**
 * Event listener for the cancel button in the modal.
 * When clicked, it hides the modal without performing any action.
 */
// Attach event listener to cancel button
document.getElementById('cancel-btn').onclick = hideModal;

// Attach event listeners to the "Merge Account" and "Unmerge Account" buttons
// Show merge modal
document.getElementById('merge-account-btn').onclick = showMergeModal;
// Show unmerge modal
document.getElementById('unmerge-account-btn').onclick = showUnmergeModal;
