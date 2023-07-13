import View from './View';
import icons from '../../img/icons.svg';
import { toggleManyCSSClasses } from '../helpers';
import { CALENDAR_AVAILABLE_TYPES } from '../config';

class CalendarView extends View {
  _parentElement = document.querySelector('.calendar-recipe-selection-window');
  _btnOpen = document.querySelector('.nav__btn--shopping-list');
  _errorMessage = "You haven't assigned any recipes for that day!";
  _overlayEl = document.querySelector('.overlay');
  _navCalendarChooseForm = document.querySelector('#nav__item__calendar__form');
  state = '';

  addHandlerGetRecipeFromCalendar(handler) {
    this._navCalendarChooseForm
      .querySelector('#get__recipe__from__calendar')
      .addEventListener('click', () =>
        handler(
          this._navCalendarChooseForm.querySelector(
            '#nav__item__calendar__form__calendar'
          ).value,
          'get'
        )
      );
  }

  addHandlerDeleteRecipeFromCalendar(handler) {
    this._navCalendarChooseForm
      .querySelector('#delete__recipe__from__calendar')
      .addEventListener('click', () =>
        handler(
          this._navCalendarChooseForm.querySelector(
            '#nav__item__calendar__form__calendar'
          ).value,
          'delete'
        )
      );
  }

  toggleSelectingCalendarRecipeDOMElements() {
    toggleManyCSSClasses(this._overlayEl, 'hidden-block', 'calendar-state');
    this._parentElement.classList.toggle('hidden-block');
  }

  renderCalendarSelection(operation) {
    this.render(operation);
    if (this._parentElement.classList.contains('hidden-block'))
      this.toggleSelectingCalendarRecipeDOMElements();
  }

  _generateMarkup() {
    let availableTypesForChosenDate = CALENDAR_AVAILABLE_TYPES;
    if (typeof this._data === 'object') {
      ({ availableTypesForChosenDate } = this._data);
      this._data = this._data.operation;
    }
    if (this._data === 'assign recipe date')
      return `
      <h2 class="heading--2">
        Choose the day for which you would like to assign chosen recipe to
      </h2>
      <input type="date" class="calendar-recipe-selection-window-calendar-element">
      <div class="one-row">
        <input
          type="button"
          value="Assign"
          class="btn btn-calendar btn-calendar-assign"
        />
        <input
          type="button"
          value="Cancel"
          class="btn btn-calendar btn-calendar-cancel"
        />

      </div>
    `;
    // if (this._data === 'get') {
    return `
      <h2 class="heading--2">
        ${
          this._data === 'get'
            ? 'Choose which type of the meal you would like to get from the chosen day'
            : this._data === 'assign recipe type'
            ? 'Choose to which type of the meal you would like to assign your recipe to'
            : this._data === 'delete'
            ? 'Choose type of meal of which recipe you would like to delete'
            : ''
        }
      </h2>
      <div class="calendar-recipe-selection-window-buttons-container">
        ${availableTypesForChosenDate
          .map(type => {
            return `
            <input type="button" value="${type}" class="btn btn-calendar btn-calendar-type btn-calendar-${type}" />
          `;
          })
          .join('')}
      </div>
      <input
        type="button"
        value="Cancel"
        class="btn btn-calendar btn-calendar-cancel"
      />
      `;
    // }
  }

  addHandlerHideCalendarOverlay(handler) {
    this._overlayEl.addEventListener('click', handler);
    this._parentElement.addEventListener('click', function (e) {
      if (e.target.closest('.btn-calendar-cancel')) handler();
    });
  }

  addHandlerShowCalendarOverviewFromRecipeView(handler) {
    document.querySelector('.recipe').addEventListener('click', function (e) {
      if (!e.target.closest('.btn--recipe--calendar')) return;
      const recipeKey = e.target.closest('.recipe__details').dataset?.key;
      const recipeId = e.target.closest('.recipe__details').dataset.recipeId;
      handler('', 'assign recipe date', '', recipeId, recipeKey);
    });
  }

  addHandlerAssignCalendarRecipeDate = function (handler) {
    this._parentElement.addEventListener(
      'click',
      this.addHandlerAssignCalendarRecipeDateCallback.bind(this, handler)
    );
  };

  addHandlerAssignCalendarRecipeDateCallback = function (handler, e) {
    if (e.target.closest('.btn-calendar-assign'))
      handler(
        this._parentElement.querySelector(
          '.calendar-recipe-selection-window-calendar-element'
        ).value
      );
  };

  addHandlerChooseRecipeType = function (handler) {
    this._parentElement.addEventListener(
      'click',
      this.addHandlerChooseRecipeTypeCallback.bind(
        this,
        handler,
        'assign recipe type',
        'add recipe'
      )
    );
  };

  addHandlerChooseRecipeTypeCallback = function (
    handler,
    oldState,
    newState,
    e
  ) {
    if (e.target.closest('.btn-calendar-type') && this.state === oldState)
      handler(
        '',
        newState,
        e.target.closest('.btn-calendar-type').value.toLowerCase()
      );
  };

  addHandlerChooseRecipeTypeToGet = function (handler) {
    this._parentElement.addEventListener(
      'click',
      this.addHandlerChooseRecipeTypeCallback.bind(
        this,
        handler,
        'get',
        'get recipe'
      )
    );
  };

  addHandlerChooseRecipeTypeToDelete = function (handler) {
    this._parentElement.addEventListener(
      'click',
      this.addHandlerChooseRecipeTypeCallback.bind(
        this,
        handler,
        'delete',
        'delete recipe'
      )
    );
  };
}

export default new CalendarView();
