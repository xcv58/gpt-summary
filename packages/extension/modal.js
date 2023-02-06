function createModal() {
  const newDiv = document.createElement('div')
  newDiv.innerHTML = `
  <div class="modal micromodal-slide" id="gpt-summary-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1">
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="gpt-summary-modal-title">
        <div class="modal__header">
          <h2 class="modal__title" id="gpt-summary-modal-title">
            GPT Summary
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </div>
        <div class="modal__content" id="gpt-summary-modal-content">
          <span class="gpt-summary-loader"></span>
        </div>
        <div class="modal__footer">
          <button class="modal__btn modal__btn-primary">Continue</button>
        </div>
      </div>
    </div>
  </div>
`
  document.body.appendChild(newDiv)
  const MicroModal = window.MicroModal
  MicroModal.init()
  MicroModal.show('gpt-summary-modal')
}

if (!document.querySelector('#gpt-summary-modal')) {
  createModal()
}
