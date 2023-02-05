const LOADING = ' · · · '

function getSelectionOrContent() {
  const selection = (window.getSelection().toString() || '').trim();
  if (selection) {
    return selection
  }
  return window.document.body.innerText;
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('onclick');
  const tabId = tab.id
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
  const { result, error } = res
  console.log(result, error);

  const prevState = await chrome.action.getBadgeText({
    tabId
  });
  const isLoading = prevState === LOADING
  console.log({ prevState });
  if (!isLoading) {
    await chrome.action.setBadgeText({
      tabId,
      text: LOADING,
    });
  }
  // TODO: mimic the API call
  setTimeout(async () => {
    await chrome.action.setBadgeText({
      tabId,
      text: ''
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        console.log("hello world!")
      },
    })
  }, 1000)
});