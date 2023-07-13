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
    this._overlay.addEventListener(
      'click',
      this._overlayClickHideWindowCallback.bind(this)
    );
  }

  _overlayClickHideWindowCallback(e) {
    if (e.currentTarget.classList.contains('calendar-state')) return;
    this.toggleWindow();
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
    const ingredientsRows =
      this._parentElement.children[1].getElementsByClassName('ingredient-row');
    console.log(ingredientsRows, [...ingredientsRows]);
    [...ingredientsRows].forEach(ingredientsRow => {
      console.log(Array.from(ingredientsRow.querySelectorAll('input')));
      Array.from(ingredientsRow.querySelectorAll('input')).forEach(input => {
        this._HandlerCheckIngredientFieldEvent = handler.bind(
          undefined,
          ingredientsRows,
          true
        );
        input.addEventListener(
          'change',
          this._HandlerCheckIngredientFieldEvent
        );
      });
    });
  }

  markInputWithIncorrectValue(input) {
    input.classList.add('incorrect_input');
  }

  markInputWithCorrectValue(input) {
    input.classList.remove('incorrect_input');
  }

  _updateLabelsAfterDelete() {
    const ingredientRows = [
      ...this._parentElement.children[1].querySelectorAll('.ingredient-row'),
    ];
    ingredientRows.forEach(
      (ingredientRow, i) =>
        (ingredientRow.firstChild.textContent = `Ingredient ${i + 1}`)
    );
    if (ingredientRows.length === 1)
      ingredientRows[0].children[3].classList.remove('deletable');
  }

  async _deleteInput(e) {
    const selectedIngredientRow = e.target.closest('.ingredient-row');
    const xInSelectedIngredientRow = e.target.closest('.deletable');
    if (!xInSelectedIngredientRow || !selectedIngredientRow || this._deleting)
      return;
    selectedIngredientRow.classList.add('hidden-element');
    this._deleting = true;
    await timeout(1, false);
    this._deleting = false;
    selectedIngredientRow.remove();
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
      const ingredientRows = [
        ...this._parentElement.children[1].querySelectorAll('.ingredient-row'),
      ];
      const ingredientNumber = ingredientRows.length + 1;

      const markup = `
      <div class="ingredient-row hidden-element" name="ingredient-${ingredientNumber}">
        Ingredient ${ingredientNumber}
        <label class="ingredient-quantity">
          <input
            type="number"
            name="ingredient-${ingredientNumber}-quantity"
            placeholder="Quantity"
            disabled
            step="0.01"
          />
        </label>
        <label class="ingredient-unit">
          <input type="text" name="ingredient-${ingredientNumber}-unit" placeholder="Unit" disabled/>
        </label>
        <label class="ingredient-description">
          <input
            type="text"
            name="ingredient-${ingredientNumber}-description"
            placeholder="Description"
            disabled
          />
        </label>
        <svg class="icon-x deletable">
          <use href="${icons}#icon-x"></use>
        </svg>
      </div>
    `;
      this._parentElement.children[1].insertAdjacentHTML('beforeend', markup);
      if (ingredientRows.length === 1)
        this._parentElement.children[1].children[1]
          .querySelector('svg')
          .classList.add('deletable');
      const addedIngredientRow = [
        ...this._parentElement.children[1].querySelectorAll('.ingredient-row'),
      ].at(-1);
      addedIngredientRow.classList.remove('hidden-element');
      await timeout(1, false);
      const addedInputs = [...addedIngredientRow.querySelectorAll('input')];
      addedInputs.forEach(input => {
        addEventListener('change', this._HandlerCheckIngredientFieldEvent);
        input.disabled = false;
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new AddRecipeView();
