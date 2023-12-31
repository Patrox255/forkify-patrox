import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup is returned if render is false
   * @this {Object} View instance
   * @author Patryk Szymanek
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  update(data) {
    // if (!data || (Array.isArray(data) && data.length === 0))
    //   return this.renderError();

    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currentElements = Array.from(
      this._parentElement.querySelectorAll('*')
    );

    newElements.forEach((newEl, i) => {
      const curEl = currentElements[i];

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue?.trim() !== ''
      )
        curEl.innerHTML = newEl.innerHTML;

      // Updates changed ATTRIBUTES
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  renderSpinner = function (clear = true) {
    const markup = `<div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>`;

    if (clear) this._clear();
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  };

  renderError(
    message = this._errorMessage,
    clear = true,
    customEl = this._parentElement
  ) {
    const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div>`;
    if (clear) this._clear();
    else {
      const spinner = customEl.querySelector('.spinner');
      if (spinner) customEl.querySelector('.spinner').remove();
      this.removeErrorElement(customEl);
    }
    customEl.insertAdjacentHTML('beforeend', markup);
  }

  removeErrorElement(customEl = this._parentElement) {
    if (customEl.querySelector('.error'))
      customEl.querySelector('.error').remove();
  }

  renderMessage(message = this._message, clear = true) {
    const markup = `
    <div class="message">
        <div>
        <svg>
            <use href="${icons}#icon-smile"></use>
        </svg>
        </div>
        <p>${message}</p>
    </div>
  `;
    if (clear) this._clear();
    else {
      this._parentElement.querySelector('.spinner').remove();
      this.removeMessageELement();
    }
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }

  removeMessageELement() {
    if (this._parentElement.querySelector('.message'))
      this._parentElement.querySelector('.message').remove();
  }
}
