import { API_URL, API_KEY } from './config.js';
import { AJAX } from './helpers.js';
import { RES_PER_PAGE } from './config.js';
import addRecipeView from './views/addRecipeView.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (recipe) {
  console.log(recipe);
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    const { recipe } = data.data;
    state.recipe = createRecipeObject(recipe);
    console.log(recipe);
    if (state.bookmarks.some(bookmark => bookmark.id === state.recipe.id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.page = 1;
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(
    ingredient =>
      (ingredient.quantity =
        (newServings / state.recipe.servings) * ingredient.quantity)
  );

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

const init = function () {
  // clearBookmarks();
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const isEntryIngredient = entryProperty =>
  String(entryProperty).startsWith('ingredient');

export const checkIngredient = async function (
  entryProperty,
  entryValue,
  errorBlank = false
) {
  try {
    if (entryValue === '' && errorBlank)
      throw new Error('Ingredient is empty! Please fill it with some data');
    if (!isEntryIngredient(entryProperty) || entryValue === '') return;
    const ingArr = entryValue.split(',').map(el => el.trim());
    console.log(ingArr);
    if (ingArr.length !== 3)
      throw new Error(
        'Wrong ingredient format! Please use the correct format :)'
      );
    const [quantity, unit, description] = ingArr;
    return { quantity: quantity ? +quantity : null, unit, description };
  } catch (err) {
    throw err;
  }
};

export const uploadRecipe = async function (newRecipe) {
  try {
    console.log(newRecipe, Object.entries(newRecipe));
    let ingredients = await Promise.all(
      Object.entries(newRecipe).map(
        async entry => await checkIngredient(entry[0], entry[1], true)
      )
    );
    ingredients = ingredients.filter(ing => ing);
    console.log(ingredients);

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(ingredients, newRecipe, recipe, createRecipeObject(recipe));
    state.recipe = createRecipeObject(recipe);
    // const { data } = await AJAX(`${API_URL}/?key=${API_KEY}`, recipe);
    // console.log(data);
    // state.recipe = createRecipeObject(data.recipe);
    // addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
