const LOADING = ' · · · '

function getSelectionOrContent() {
  const selection = (window.getSelection().toString() || '').trim()
  if (selection) {
    return selection
  }
  return window.document.body.innerText
}

ENDPOINT = 'https://gpt-summary-git-stream-api-xcv58.vercel.app/api/summary'
MAX_CHARACTER = 8000

async function executeScript(options) {
  let results = await chrome.scripting.executeScript(options)
  if (!results || !Array.isArray(results) || results.length <= 0) {
    console.log('no results: ', results)
    return
  }
  return results[0]
}

async function upsertInjections(tabId) {
  const modalInjected = await executeScript({
    target: { tabId },
    func: () => {
      return (
        window.document.querySelector('#gpt-summary-modal') && window.MicroModal
      )
    },
  })
  if (!modalInjected.result) {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['modal.css'],
    })
    return await chrome.scripting.executeScript({
      target: { tabId },
      files: ['micromodal.min.js', 'modal.js'],
    })
  }
}

async function sendResult(tabId, data) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (data) => {
      console.log('data:', data)
      const contentDiv = window.document.querySelector(
        '#gpt-summary-modal-content'
      )
      contentDiv.innerText = data
      const MicroModal = window.MicroModal
      MicroModal.init()
      MicroModal.show('gpt-summary-modal')
    },
    args: [data],
  })
}

async function setLoadingIndicator(tabId) {
  await chrome.action.setBadgeText({
    tabId,
    text: LOADING,
  })
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const contentDiv = window.document.querySelector(
        '#gpt-summary-modal-content'
      )
      contentDiv.innerHTML = 'Loading...'
    },
  })
}

async function loaded(tabId) {
  await chrome.action.setBadgeText({
    tabId,
    text: '',
  })
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('onclick')
  const tabId = tab.id
  await upsertInjections(tabId)
  const prevState = await chrome.action.getBadgeText({
    tabId,
  })
  const isLoading = prevState === LOADING
  if (!isLoading) {
    await setLoadingIndicator(tabId)
  } else {
    console.log('Pending request')
    return
  }

  let { result: content } = await executeScript({
    target: { tabId },
    func: getSelectionOrContent,
  })
  if (content.length >= MAX_CHARACTER) {
    console.log(`content larger than ${MAX_CHARACTER} characters`)
    content = content.substring(0, MAX_CHARACTER)
  }
  console.log('content:', content)

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })
  console.log('response:', response)

  if (!response.ok) {
    console.log('error', response.statusText)
    loaded(tabId)
    // TODO: add error
    sendResult(
      tabId,
      `Error retrieving data. Please check your internet connection and try again later.`
    )
    return
  }

  const data = response.body
  if (!data) {
    return
  }

  const reader = data.getReader()
  const decoder = new TextDecoder()
  let done = false

  let summary = ''
  while (!done) {
    const { value, done: doneReading } = await reader.read()
    done = doneReading
    const chunkValue = decoder.decode(value)
    summary += chunkValue
    console.log('summary:', summary)
    await sendResult(tabId, summary)
  }
  loaded(tabId)
})
