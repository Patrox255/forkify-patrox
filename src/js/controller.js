import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import shoppingListView from './views/shoppingListView.js';
import previewView from './views/previewView.js';
import calendarView from './views/calendarView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  const id = window.location.hash.slice(1);
  if (!id) return;

  try {
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);

    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  const query = searchView.getQuery();
  if (!query) return;
  try {
    resultsView.renderSpinner();
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
};

const controlServings = function (
  newServings,
  recipeLocalization = 'recipePage',
  recipeId = 0
) {
  if (recipeLocalization === 'recipePage') {
    model.updateServings(newServings);
    recipeView.update(model.state.recipe);
  }
  if (recipeLocalization === 'shoppingList') {
    model.updateServings(newServings, recipeLocalization, recipeId);
    shoppingListView.update(model.state.shoppingList);
  }
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.removeErrorElement();
    addRecipeView.removeMessageELement();
    addRecipeView.renderSpinner(false);
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage(undefined, false);

    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.log('💥💥' + err.message);
    addRecipeView.renderError(err, false);
  }
};

const checkIngredient = async function (
  ingredientRows,
  callCheckOnNeighbourInputs,
  e
) {
  console.log(e, ingredientRows);
  try {
    const changedIngredientRow = e.target.closest('.ingredient-row');
    if (!changedIngredientRow) return;
    if (callCheckOnNeighbourInputs)
      [...changedIngredientRow.querySelectorAll('input')]
        .filter(input => input !== e.target)
        .forEach(input =>
          checkIngredient(ingredientRows, false, { target: input })
        );
    console.log(
      [...changedIngredientRow.querySelectorAll('input')].filter(
        input => input !== e.target
      )
    );
    let errorBlank = false;
    if (String(e.target.name).includes('description')) errorBlank = true;
    console.log(
      await model.checkIngredient(e.target.name, e.target.value, errorBlank)
    );
    addRecipeView.markInputWithCorrectValue(e.target);
    if (
      e.target.value !== '' &&
      changedIngredientRow === [...ingredientRows].at(-1)
    )
      await addRecipeView.renderNextIngredientlabel();
  } catch (_) {
    console.log(_);
    addRecipeView.markInputWithIncorrectValue(e.target);
  }
};

const controlAddRecipeToShoppingList = function (recipe = model.state.recipe) {
  model.addRecipeToShoppingList(recipe);
  recipeView.changeShoppingListIcon();
};

const controlRemoveRecipeFromShoppingList = function (
  recipe = model.state.recipe
) {
  model.removeRecipeFromShoppingList(recipe);
  recipeView.changeShoppingListIcon();
};

const controlOpenShoppingList = function () {
  shoppingListView.render(model.state.shoppingList);
  window.location.hash = '';
  bookmarksView.update(model.state.bookmarks);
  resultsView.update(model.getSearchResultsPage());
};

const hideCalendarOverlay = function () {
  console.log(model.state.overlay.state);
  if (model.state.overlay.state) {
    calendarView.toggleSelectingCalendarRecipeDOMElements();
    model.eraseStateOfAppOverlay();
    console.log(model.state.overlay);
  }
};

const controlCalendar = function (
  date,
  operation,
  type = '',
  recipeId = 0,
  recipeKey = 0
) {
  let availableTypesForChosenDate;
  if (operation === 'get' || operation === 'delete') {
    calendarView.removeErrorElement(calendarView._navCalendarChooseForm);
    if (!date)
      return calendarView.renderError(
        'You have to pick date which you want to select recipe from!',
        false,
        calendarView._navCalendarChooseForm
      );
    calendarView.state = operation;
    availableTypesForChosenDate =
      model.generateAvailableTypesForChosenDate(date);
    if (
      !availableTypesForChosenDate ||
      availableTypesForChosenDate.length === 0
    )
      return calendarView.renderError(
        'There are no recipes associated with this date!',
        false,
        calendarView._navCalendarChooseForm
      );
  }
  if (operation === 'get recipe') {
    const chosenRecipeInfo = model.getRecipeInfoFromCalendar(type);
    eraseCalendarViewState();
    window.location.hash = chosenRecipeInfo.recipeId;
    controlRecipes();
    return;
  }
  if (operation === 'delete recipe') {
    model.deleteRecipeFromCalendar(type);
    eraseCalendarViewState();
    model.persistCalendarRecipes();
    return;
  }
  console.log(model.state);
  date ||= model.state.overlay?.date;
  recipeId ||= model.state.overlay?.recipeInfo?.id;
  recipeKey ||= model.state.overlay?.recipeInfo?.key;
  calendarView.removeErrorElement();
  if (operation === 'add recipe') {
    console.log(type);
    if (model.isAlreadyInCalendarRecipeOfSuchType(type))
      return calendarView.renderError(
        'There is already recipe with such type associated to this date!',
        false
      );
    model.addRecipeToCalendar(type);
    eraseCalendarViewState();
    console.log(model.state);
    return;
  }
  if (operation === 'get' || operation === 'delete')
    calendarView.renderCalendarSelection({
      operation,
      availableTypesForChosenDate,
    });
  else calendarView.renderCalendarSelection(operation);
  model.setStateOfAppOverlay('rendered', date, operation, {
    id: recipeId,
    ...(recipeKey && { key: recipeKey }),
  });
  console.log(model.state.overlay);
  calendarView.state = operation;
};

const eraseCalendarViewState = function () {
  calendarView.toggleSelectingCalendarRecipeDOMElements();
  model.eraseStateOfAppOverlay();
};

const assignCalendarRecipeDate = function (date) {
  calendarView.removeErrorElement();
  if (!date) return calendarView.renderError('Choose the date!', false);
  controlCalendar(date, 'assign recipe type');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerAddOrDeleteRecipeToShoppingList(
    controlAddRecipeToShoppingList,
    controlRemoveRecipeFromShoppingList
  );
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  addRecipeView.addHandlerCheckIngredientField(checkIngredient);
  shoppingListView.addHandlerOpenShoppingList(controlOpenShoppingList);
  shoppingListView.addHandlerChangeServings(controlServings);
  calendarView.addHandlerGetRecipeFromCalendar(controlCalendar);
  calendarView.addHandlerDeleteRecipeFromCalendar(controlCalendar);
  calendarView.addHandlerHideCalendarOverlay(hideCalendarOverlay);
  calendarView.addHandlerShowCalendarOverviewFromRecipeView(controlCalendar);
  calendarView.addHandlerAssignCalendarRecipeDate(assignCalendarRecipeDate);
  calendarView.addHandlerChooseRecipeType(controlCalendar);
  calendarView.addHandlerChooseRecipeTypeToGet(controlCalendar);
  calendarView.addHandlerChooseRecipeTypeToDelete(controlCalendar);
};
init();
