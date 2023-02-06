const LOADING = ' · · · '

function getSelectionOrContent() {
  const selection = (window.getSelection().toString() || '').trim()
  if (selection) {
    return selection
  }
  return window.document.body.innerText
}

async function fetchSummary(content) {
  await new Promise((r) => setTimeout(r, 100))
  return {
    data: `
    We design, build, and evaluate novel computer systems. We are currently working on smartphones, today's most pervasive mobile technology. Our research aims to make smartphones more useful, safer, and more sustainable. But our primary goal is training computer scientists and our primary product is people. We try to align everything in service of that goal, which results in putting people before projects before papers.
    People
    Putting people first. Our primary job is training future researchers and developers. Lab members are here to learn. Students come up with new ideas, develop prototype systems, evaluate them, and then communicate their results to the broader scientific community. Along the way they are developing analytical and leadership abilities to bootstrap a successful career in technology.
    Projects
    Putting people before projects. Group members choose and lead projects that excite them. Projects proceed at a pace that benefits members' personal development. Along the way, we are careful not to miss opportunities to allow group members to learn and grow. Sometimes this means development doesn't always happen as fast as possible.
    Papers
    Putting projects before papers. We work on interesting projects with potential for impact—not just ones that might quickly produce publications. When we discover something interesting, publishing is our chance to share it with the world. We don't work on projects to publish papers—we work on projects because we're curious about what happens when we try something new.
    Together In the Lab
    PhoneLab
    blue is fortunate to have a single lab large enough to house all current group members. We work in Davis Hall Room 301B, also know as the PhoneLab. All group members—faculty, administrators, graduate students and undergraduates—work side-by-side in our lab. This arrangement is inspired by the organization of groups like the Berkeley AMP Lab, as well as the organization of typical startups and technology companies.

    Working together allows for spontaneous collaboration and problem solving. Group members are asked to be present in the lab during certain hours to facilitate interaction. New members find it easy to get started since there are always more experienced developers nearby. Many group discussions that take place in the lab have benefited from being overheard by group members that were not directly engaged in the project. It also just ends up being a lot of fun!

  `,
  }
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
      files: ['topbar.min.js', 'micromodal.min.js', 'modal.js'],
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
    func: () => window.topbar.hide(),
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
      console.log({ MicroModal }, MicroModal.config)
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
    func: () => window.topbar.show(),
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
