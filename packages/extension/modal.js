function createModal() {
  const newDiv = document.createElement('div')
  newDiv.innerHTML = `
  <div class="modal micromodal-slide" id="gpt-summary-modal" aria-hidden="true">
    <div class="gtp-summary_modal__overlay" tabindex="-1">
      <div class="gtp-summary_modal__container" role="dialog" aria-modal="true" aria-labelledby="gpt-summary-modal-title">
        <div class="gtp-summary_modal__header">
          <h2 class="modal__title" id="gpt-summary-modal-title">
            GPT Summary
          </h2>
          <button class="gtp-summary_modal__close" aria-label="Close modal" data-micromodal-close></button>
        </div>
        <div class="gtp-summary_modal__content" id="gpt-summary-modal-content">
          Loading...
        </div>
        <div class="gtp-summary_modal__footer">
          <button class="gtp-summary_modal__btn gtp-summary_modal__btn-primary" id="gpt-summary-copy">Copy</button>
        </div>
      </div>
    </div>
  </div>
`
  document.body.appendChild(newDiv)
  document
    .querySelector('#gpt-summary-copy')
    .addEventListener('click', function (e) {
      const text = document.querySelector(
        '#gpt-summary-modal-content'
      ).textContent
      navigator.clipboard.writeText(text).then(
        () => {
          console.log('Text copied to clipboard successfully!')
          e.target.innerText = 'Copied!'
          setTimeout(() => {
            e.target.innerText = 'Copy'
          }, 1000)
        },
        (err) => {
          console.error('Failed to copy text: ', err)
        }
      )
    })
  const MicroModal = window.MicroModal
  MicroModal.init()
  MicroModal.show('gpt-summary-modal')
}

if (!document.querySelector('#gpt-summary-modal')) {
  createModal()
}
