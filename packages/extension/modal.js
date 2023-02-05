function createModal() {
  const newDiv = document.createElement('div')
  newDiv.innerHTML = `
  <div class="modal micromodal-slide" id="gpt-summary-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="gpt-summary-modal-title">
        <header class="modal__header">
          <h2 class="modal__title" id="gpt-summary-modal-title">
            Micromodal
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="gpt-summary-modal-content">
          <p>
            Try hitting the <code>tab</code> key and notice how the focus stays within the modal itself. Also, <code>esc</code> to close modal.
          </p>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary">Continue</button>
          <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
        </footer>
      </div>
    </div>
  </div>
`
  document.body.appendChild(newDiv)
}

if (!document.querySelector('#gpt-summary-modal')) {
  createModal()
}
