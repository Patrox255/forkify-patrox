import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

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

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
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

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  addRecipeView.addHandlerCheckIngredientField(checkIngredient);
};
init();
