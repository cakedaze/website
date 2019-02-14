Array.from(document.querySelectorAll('[data-scroll-link]'))
  .forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      document.querySelector(event.target.hash)
        .scrollIntoView({ behavior:'smooth' })
    })
  });
