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
  shoppingList: [],
  overlay: {
    state: '',
    date: '',
    operation: '',
    recipeInfo: {
      id: 0,
      key: 0,
    },
  },
  calendarRecipes: [],
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
    if (
      state.shoppingList.some(
        shoppingListRecipe => shoppingListRecipe.id === id
      )
    )
      state.recipe.addedToShoppingList = true;
    else state.recipe.addedToShoppingList = false;
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

export const updateServings = function (
  newServings,
  recipeLocalization = 'recipePage',
  recipeId = 0
) {
  let recipe;
  if (recipeLocalization === 'recipePage') recipe = state.recipe;
  if (recipeLocalization === 'shoppingList')
    recipe = state.shoppingList.find(recipeObj => recipeObj.id === recipeId);

  recipe.ingredients.forEach(
    ingredient =>
      (ingredient.quantity =
        (newServings / recipe.servings) * ingredient.quantity)
  );

  recipe.servings = newServings;
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

const isEntryIngredient = entryProperty =>
  String(entryProperty).startsWith('ingredient');

export const checkIngredient = async function (
  entryProperty,
  entryValue,
  errorBlank = false
) {
  try {
    if (entryValue === '' && errorBlank)
      throw new Error(
        'Ingredient description is empty! Please fill it with some data'
      );
    if (!isEntryIngredient(entryProperty)) return;
    // const ingArr = entryValue.split(',').map(el => el.trim());
    // console.log(ingArr);
    // if (ingArr.length !== 3)
    //   throw new Error(
    //     'Wrong ingredient format! Please use the correct format :)'
    //   );
    // const [quantity, unit, description] = ingArr;
    const name = entryProperty.includes('description')
      ? 'description'
      : entryProperty.includes('quantity')
      ? 'quantity'
      : 'unit';
    const ingredientValue =
      entryValue === '' ? (name === 'quantity' ? null : '') : entryValue;
    // return { quantity: quantity ? +quantity : null, unit, description };
    const ingredientObj = {};
    ingredientObj[name] = ingredientValue;
    return ingredientObj;
  } catch (err) {
    throw err;
  }
};

export const uploadRecipe = async function (newRecipe) {
  try {
    let ingredients = await Promise.all(
      Object.entries(newRecipe).map(async entry => {
        if (
          entry[0].startsWith('ingredient') &&
          !entry[0].includes('description')
        )
          return await checkIngredient(entry[0], entry[1], false);
        else return await checkIngredient(entry[0], entry[1], true);
      })
    );
    ingredients = ingredients.filter(ing => ing !== undefined);
    ingredients = ingredients.reduce(
      (acc, ingObj) => {
        const [ingEntry] = Object.entries(ingObj);
        acc.tempObj[ingEntry[0]] = ingEntry[1];
        if (Object.entries(acc.tempObj).length === 3) {
          acc.ingArr.push(acc.tempObj);
          acc.tempObj = {};
        }
        console.log(acc, ingEntry[0], ingEntry[1]);
        return acc;
      },
      { tempObj: {}, ingArr: [] }
    ).ingArr;

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const { data } = await AJAX(`${API_URL}/?key=${API_KEY}`, recipe);
    console.log(data);
    state.recipe = createRecipeObject(data.recipe);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export const addRecipeToShoppingList = function (recipe) {
  console.log(recipe);
  const shoppingListObj = {
    id: recipe.id,
    image: recipe.image,
    ingredients: recipe.ingredients,
    servings: recipe.servings,
    title: recipe.title,
    ...(recipe.key && { key: recipe.key }),
  };
  state.recipe.addedToShoppingList = true;
  state.shoppingList.push(shoppingListObj);
  console.log(state.shoppingList);
  localStorage.setItem('shoppingList', JSON.stringify(state.shoppingList));
};

export const removeRecipeFromShoppingList = function (recipe) {
  state.shoppingList = state.shoppingList.filter(
    shoppingListRecipe => shoppingListRecipe.id !== recipe.id
  );
  state.recipe.addedToShoppingList = false;
  console.log(state.shoppingList);
  localStorage.setItem('shoppingList', JSON.stringify(state.shoppingList));
};

export const setStateOfAppOverlay = function (
  newState,
  newDate = '',
  newOperation = '',
  recipeInfo = {}
) {
  console.log(recipeInfo);
  state.overlay = {
    state: newState,
    date: newDate,
    operation: newOperation,
    recipeInfo,
  };
};

export const eraseStateOfAppOverlay = function () {
  state.overlay = {};
};

export const addRecipeToCalendar = function (type) {
  // [{date: date, recipes:[{type:"", recipeId: 0, (recipeKey: 0)}}]]
  const dateIndex = state.calendarRecipes.findIndex(
    entry =>
      entry.date === state.overlay.date &&
      !entry.recipes.some(recipe => recipe.type === type)
  );
  const recipeToPush = {
    type,
    recipeId: state.overlay.recipeInfo.id,
    ...(state.overlay.recipeInfo?.key && {
      recipeKey: state.overlay.recipeInfo?.key,
    }),
  };
  if (dateIndex === -1)
    state.calendarRecipes.push({
      date: state.overlay.date,
      recipes: [recipeToPush],
    });
  else state.calendarRecipes[dateIndex].recipes.push(recipeToPush);
  persistCalendarRecipes();
};

export const isAlreadyInCalendarRecipeOfSuchType = function (type) {
  return state.calendarRecipes.some(
    entry =>
      entry.date === state.overlay.date &&
      entry.recipes.some(recipe => recipe.type === type)
  );
};

export const persistCalendarRecipes = function () {
  localStorage.setItem(
    'calendarRecipes',
    JSON.stringify(state.calendarRecipes)
  );
};

export const generateAvailableTypesForChosenDate = function (date) {
  return state.calendarRecipes
    .find(entry => entry.date === date)
    ?.recipes.map(calendarRecipe => calendarRecipe.type);
};

const _getRecipeObjFromCalendar = function (type) {
  return state.calendarRecipes
    .find(entry => entry.date === state.overlay.date)
    .recipes.find(calendarRecipe => calendarRecipe.type === type);
};

export const getRecipeInfoFromCalendar = function (type) {
  console.log(state.overlay, type, state.calendarRecipes);
  const { recipeId, recipeKey } = _getRecipeObjFromCalendar(type);
  return { recipeId, ...(recipeKey && { recipeKey }) };
};

export const deleteRecipeFromCalendar = function (type) {
  const recipeToDelete = _getRecipeObjFromCalendar(type);
  const calendarRecipesEntryIndexInWhichThisRecipeIs =
    state.calendarRecipes.findIndex(entry =>
      entry.recipes.some(recipe => recipe === recipeToDelete)
    );
  state.calendarRecipes[calendarRecipesEntryIndexInWhichThisRecipeIs].recipes =
    state.calendarRecipes[
      calendarRecipesEntryIndexInWhichThisRecipeIs
    ].recipes.filter(recipe => recipe !== recipeToDelete);
  console.log(state.calendarRecipes);
};

const init = function () {
  // clearBookmarks();
  const bookmarksStorage = localStorage.getItem('bookmarks');
  const shoppingListStorage = localStorage.getItem('shoppingList');
  const calendarRecipesStorage = localStorage.getItem('calendarRecipes');
  if (bookmarksStorage) state.bookmarks = JSON.parse(bookmarksStorage);
  if (shoppingListStorage) state.shoppingList = JSON.parse(shoppingListStorage);
  if (calendarRecipesStorage)
    state.calendarRecipes = JSON.parse(calendarRecipesStorage);
};
init();
