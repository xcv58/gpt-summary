const LOADING = ' · · · '

function getSelectionOrContent() {
  const selection = (window.getSelection().toString() || '').trim();
  if (selection) {
    return selection
  }
  return window.document.body.innerText;
}

async function fetchSummary(content) {
  try {
    response = await fetch("https://gpt-summary.xcv58.org/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    })
    const data = await response.json();
    return data
  } catch (e) {
    console.error(error)
    return { error }
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('onclick');
  const tabId = tab.id
  const prevState = await chrome.action.getBadgeText({
    tabId
  });
  const isLoading = prevState === LOADING
  if (!isLoading) {
    await chrome.action.setBadgeText({
      tabId,
      text: LOADING,
    });
  } else {
    console.log('Pending request');
    return
  }
  let results = await chrome.scripting.executeScript({
    target: { tabId },
    func: getSelectionOrContent,
  })
  console.log(results);
  if (!results || !Array.isArray(results) || results.length <= 0) {
    console.log('no results: ', results);
    return
  }
  const [res] = results
  const { result } = res
  console.log(result);

  const { data, error } = await fetchSummary(result)
  console.log({ data, error });
  await chrome.action.setBadgeText({
    tabId,
    text: ''
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (data) => {
      console.log('data:', data)
    },
    args: [data]
  })
});