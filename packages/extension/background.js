const LOADING = ' · · · '

function getSelectionOrContent() {
  const selection = (window.getSelection().toString() || '').trim()
  if (selection) {
    return selection
  }
  return window.document.body.innerText
}

async function fetchSummary(content) {
  try {
    response = await fetch('https://gpt-summary.xcv58.org/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
    const data = await response.json()
    return data
  } catch (e) {
    console.error(error)
    return { error }
  }
}

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
  await chrome.action.setBadgeText({
    tabId,
    text: '',
  })
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
      contentDiv.innerHTML = `<span class="gpt-summary-loader"></span>`
    },
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

  const { result } = await executeScript({
    target: { tabId },
    func: getSelectionOrContent,
  })
  console.log(result)

  const { data, error } = await fetchSummary(result)
  console.log({ data, error })
  await sendResult(tabId, data)
})
