// Saves options to chrome.storage
function save_options() {
  const openai_api_key = document.getElementById('openai_api_key').value
  chrome.storage.sync.set(
    {
      openai_api_key,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById('status')
      status.textContent = 'Options saved.'
      setTimeout(() => {
        status.textContent = ''
      }, 750)
    }
  )
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      openai_api_key: '',
    },
    function (items) {
      document.getElementById('openai_api_key').value = items.openai_api_key
    }
  )
}
document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save').addEventListener('click', save_options)
