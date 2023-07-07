import icons from 'url:../../img/icons.svg';
import View from './View';
import { timeout } from '../helpers';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _message = 'Recipe was successfully uploaded :)';
  _deleting = false;
  _HandlerCheckIngredientFieldEvent;

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this._addHandlerDeleteInput();
    this._renderIcons();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden-block');
    this._window.classList.toggle('hidden-block');
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  _addHandlerDeleteInput() {
    this._parentElement.children[1].addEventListener(
      'click',
      this._deleteInput.bind(this)
    );
  }

  _renderIcons() {
    Array.from(this._parentElement.querySelectorAll('.icon-x')).forEach(icon =>
      icon.children[0].setAttribute('href', `${icons}#icon-x`)
    );
  }

  addHandlerCheckIngredientField(handler) {
    const inputs = [
      this._parentElement
        .querySelector('.upload__column')
        .getElementsByTagName('input'),
    ];
    Array.from(...inputs).forEach(input => {
      console.log(input);
      this._HandlerCheckIngredientFieldEvent = handler.bind(undefined, inputs);
      input.addEventListener('change', this._HandlerCheckIngredientFieldEvent);
    });
  }

  markInputWithIncorrectValue(input) {
    input.classList.add('incorrect_input');
  }

  markInputWithCorrectValue(input) {
    input.classList.remove('incorrect_input');
  }

  _updateLabelsAfterDelete() {
    const labels = [
      ...this._parentElement.children[1].querySelectorAll('label'),
    ];
    labels.forEach(
      (label, i) => (label.firstChild.textContent = `Ingredient ${i + 1}`)
    );
    if (labels.length === 1)
      labels[0].children[1].classList.remove('deletable');
  }

  async _deleteInput(e) {
    if (!e.target.closest('.deletable') || this._deleting) return;
    const selectedLabel = e.target.closest('label');
    selectedLabel.classList.add('hidden-element');
    this._deleting = true;
    await timeout(1, false);
    this._deleting = false;
    selectedLabel.remove();
    this._updateLabelsAfterDelete();
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  async renderNextIngredientlabel() {
    try {
      const labels = [
        ...this._parentElement.children[1].querySelectorAll('label'),
      ];
      const labelNumber = labels.length + 1;

      const markup = `
          <label class="hidden-element">Ingredient ${labelNumber}
            <input
              value=""
              type="text"
              disabled
              name="ingredient-${labelNumber}"
              placeholder="Format: 'Quantity,Unit,Description'"
              class="ingredient_input" /><svg class="icon-x deletable">
              <use href='${icons}#icon-x'></use></svg
          ></label>
    `;
      this._parentElement.children[1].insertAdjacentHTML('beforeend', markup);
      if (labels.length === 1)
        this._parentElement.children[1].children[1]
          .querySelector('svg')
          .classList.add('deletable');
      const addedLabel = [
        ...this._parentElement.children[1].querySelectorAll('label'),
      ].at(-1);
      addedLabel.classList.remove('hidden-element');
      console.log(addedLabel);
      await timeout(1, false);
      const addedInput = addedLabel.children[0];
      addedInput.addEventListener(
        'change',
        this._HandlerCheckIngredientFieldEvent
      );
      console.log(addedInput);
      addedInput.disabled = false;
    } catch (err) {
      console.log(err);
    }
  }
}

export default new AddRecipeView();
