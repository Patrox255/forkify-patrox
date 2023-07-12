import View from './View';
import icons from '../../img/icons.svg';
import recipeView from './recipeView';
import { INGREDIENTS_PER_COLUMN_IN_SHOPPING_LIST } from '../config';

class shoppingListView extends View {
  _parentElement = document.querySelector('.recipe');
  _btnOpen = document.querySelector('.nav__btn--shopping-list');
  _errorMessage =
    'Your shopping list is currently empty. Feel free to add here some products using the cart icon on their pages!';

  constructor() {
    super();
    this._parentElement.addEventListener(
      'click',
      this._redirectToRecipePage.bind(this)
    );
  }

  _generateMarkup() {
    console.log(this._data);
    return `
        <header><h1 class="recipe__title"><span>Shopping List</span></h1></header>
        <div id="shopping-list">
            ${
              this._data
                .map(shoppingListRecipe => {
                  console.log(shoppingListRecipe.ingredients);
                  return `
                    <div class="shopping-list_recipe_border"></div> 
                    <div class="shopping-list_recipe" data-recipe-id="${
                      shoppingListRecipe.id
                    }">
                        <header class="shopping-list_recipe_header">
                            <h2 class="heading--2">${
                              shoppingListRecipe.title
                            }</h2>
                            <img src="${shoppingListRecipe.image}">
                        </header>
                        <div class="shopping-list_recipe_servings">
                            <h2 class="heading--2">Servings:&nbsp${
                              shoppingListRecipe.servings
                            }</h2>
                            <div class="shopping-list_recipe_servings_update_div">
                                <div class="recipe__info-buttons">
                                    <button class="btn--tiny btn--update-servings" data-update-to="${
                                      +shoppingListRecipe.servings - 1
                                    }">
                                    <svg>
                                        <use href="${icons}#icon-minus-circle"></use>
                                    </svg>
                                    </button>
                                    <button class="btn--tiny btn--update-servings" data-update-to="${
                                      +shoppingListRecipe.servings + 1
                                    }">
                                    <svg>
                                        <use href="${icons}#icon-plus-circle"></use>
                                    </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="shopping-list_recipe_ingredients">
                            ${this._createCustomLengthIngredientsColumns(
                              shoppingListRecipe.ingredients
                            )}
                        </div>
                    </div>
                `;
                })
                .join('') + `<div class="shopping-list_recipe_border"></div> `
            }
            <div id="shopping-list_overview">
                <header class="heading--2">Total ingredients needed</header>
                <div id="shopping-list_overview_ingredients">${this._createSortedTotalIngredientsArr(
                  this._data
                )}</div>
            </div>
        </div>
    `;
  }

  _createCustomLengthIngredientsColumns(
    ingredients,
    customLength = INGREDIENTS_PER_COLUMN_IN_SHOPPING_LIST
  ) {
    return (
      ingredients
        .map((ingredient, i) => {
          let markup = recipeView.generateMarkupIngredient(ingredient);
          const nr = i;
          if (nr === 0 || nr % customLength === 0) {
            markup =
              "<div class='shopping-list_recipe_ingredients_column'>" + markup;
            markup = nr !== 0 ? '</div>' + markup : markup;
          }
          return markup;
        })
        .join('') + '</div>'
    );
  }

  addHandlerOpenShoppingList(handler) {
    this._btnOpen.addEventListener('click', handler);
  }

  addHandlerChangeServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn =
        e.target.closest('.shopping-list_recipe') &&
        e.target.closest(' .btn--update-servings');
      if (!btn) return;
      handler(
        btn.dataset.updateTo,
        'shoppingList',
        e.target.closest('.shopping-list_recipe').dataset.recipeId
      );
    });
  }

  _redirectToRecipePage(e) {
    const el = e.target.closest('.shopping-list_recipe_header');
    if (!el) return;
    console.log(el);
    const recipeId = el.closest('.shopping-list_recipe').dataset.recipeId;
    window.location.hash = recipeId;
    window.location.reload();
  }

  // GETS INDEX OF NEXT NON SORTED INGREDIENT IN INGREDIENTS TAB
  _getNextIngredientsArrIndexToSort(
    totalIngredientsData,
    curIngredientNr,
    sortedIngredients
  ) {
    if (curIngredientNr + 1 >= totalIngredientsData.length) return null;
    curIngredientNr++;
    while (curIngredientNr < totalIngredientsData.length) {
      if (
        sortedIngredients.some(
          ing => ing === totalIngredientsData[curIngredientNr]
        )
      )
        curIngredientNr += 1;
      else return curIngredientNr;
    }
  }

  // This method tries to place similar ingredients next to each other. By similar I mean with similar description
  _tryToSortAnIngredient(
    totalIngredientsData,
    curIngredientNr,
    sortedIngredients
  ) {
    let ing = totalIngredientsData[curIngredientNr];
    // Firstly we try to get index of ingredient, which has similar description, so that we can place our selected ingredient next to it
    const similarDescriptionIngredientIndex = totalIngredientsData.findIndex(
      ingredient =>
        (ingredient.description
          .toLowerCase()
          .includes(ing.description.toLowerCase()) ||
          ing.description
            .toLowerCase()
            .includes(ingredient.description.toLowerCase())) &&
        ingredient !== ing
    );
    // If we don't get such index we call this method with next index
    if (similarDescriptionIngredientIndex === -1) {
      const nextIngredientIndexToSort = this._getNextIngredientsArrIndexToSort(
        totalIngredientsData,
        curIngredientNr,
        sortedIngredients
      );
      console.log(nextIngredientIndexToSort);
      if (nextIngredientIndexToSort)
        this._tryToSortAnIngredient(
          totalIngredientsData,
          nextIngredientIndexToSort,
          sortedIngredients
        );
      return;
    }
    // Then we get all other ingredients, which are also similar to the upper index, so that we can afterwards get positions of all ingredients, which aren't similar to it
    const allSimilarIngredients = totalIngredientsData.filter(
      (ingredient, index) =>
        (ingredient.description
          .toLowerCase()
          .includes(
            totalIngredientsData[
              similarDescriptionIngredientIndex
            ].description.toLowerCase()
          ) ||
          totalIngredientsData[similarDescriptionIngredientIndex].description
            .toLowerCase()
            .includes(ingredient.description.toLowerCase())) &&
        index !== similarDescriptionIngredientIndex
    );

    // console.log(
    //   ing,
    //   allSimilarIngredients,
    //   curIngredientNr,
    //   similarDescriptionIngredientIndex
    // );
    // Here we try to get those positions, while also taking in mind that we won't like to have positions of already repositioned ingredients
    const positionsOfNonSimilarIngredients = totalIngredientsData
      .map((ingredient, j) => {
        if (
          allSimilarIngredients.some(
            similarIngredient => similarIngredient === ingredient
          ) ||
          ingredient.repositioned
        )
          return false;
        return j;
      })
      .filter(
        pos => (pos === 0 || pos) && pos !== similarDescriptionIngredientIndex
      );

    // Here for each position we determine its distance from similar ingredient index
    const positionsDistanceBetweenEachFreePositionAndSimilarIngredient =
      positionsOfNonSimilarIngredients.map(pos => {
        return {
          pos,
          distance: Math.abs(pos - similarDescriptionIngredientIndex),
        };
      });

    // Afterwards we get the index of non similar ingredient, which is closest to the similar in description ingredient
    const minPosition =
      positionsDistanceBetweenEachFreePositionAndSimilarIngredient.reduce(
        (acc, pos) => {
          if (acc.distance > pos.distance) return pos;
          return acc;
        },
        positionsDistanceBetweenEachFreePositionAndSimilarIngredient[0]
      );

    if (!minPosition) {
      const nextIngredientIndexToSort = this._getNextIngredientsArrIndexToSort(
        totalIngredientsData,
        curIngredientNr,
        sortedIngredients
      );
      console.log(nextIngredientIndexToSort);
      if (nextIngredientIndexToSort)
        this._tryToSortAnIngredient(
          totalIngredientsData,
          nextIngredientIndexToSort,
          sortedIngredients
        );
      return;
    }
    // console.log(
    //   ing,
    //   totalIngredientsData[minPosition.pos],
    //   totalIngredientsData[minPosition.pos + 1],
    //   totalIngredientsData[minPosition.pos - 1]
    // );
    // Eventually we swap iterated ingredient with the one we've got from our algorithm, at the same time we mark ingredient with similar description and iterated as repositioned
    [
      totalIngredientsData[curIngredientNr],
      totalIngredientsData[minPosition.pos],
    ] = [totalIngredientsData[minPosition.pos], { ...ing, repositioned: true }];
    totalIngredientsData[similarDescriptionIngredientIndex].repositioned = true;
    // console.log(
    //   totalIngredientsData[curIngredientNr],
    //   totalIngredientsData[minPosition.pos],
    //   totalIngredientsData[minPosition.pos + 1],
    //   totalIngredientsData[minPosition.pos - 1]
    // );
    sortedIngredients.push(
      totalIngredientsData[minPosition.pos],
      totalIngredientsData[similarDescriptionIngredientIndex]
    );
    // Then we call the method on the same index, because now ingredient with such index has changed, because of our swap
    const nextIngredientIndexToSort = this._getNextIngredientsArrIndexToSort(
      totalIngredientsData,
      curIngredientNr - 1,
      sortedIngredients
    );
    if (nextIngredientIndexToSort)
      this._tryToSortAnIngredient(
        totalIngredientsData,
        nextIngredientIndexToSort,
        sortedIngredients
      );
    return;
  }

  /* Firstly this method creates object containing each unique ingredient and its quality (I had to only add quantities of ingredients which have the same description
     and unit, because otherwise it would be very hard to determine whether individual ingredients are the same, because even though we have specifed format user still 
     can enter the ingredient data in other way, e.g. unit can be cup or cups.)
  */
  _createSortedTotalIngredientsArr(shoppingList) {
    const totalIngredientsData = this._data.reduce(
      (acc, shoppingListRecipe) => {
        shoppingListRecipe.ingredients.forEach(ingredient => {
          const ingId = acc.findIndex(ing => {
            ing.unit.replaceAll('.', '');
            ingredient.unit.replaceAll('.', '');
            return (
              ing.description === ingredient.description &&
              ing.unit === ingredient.unit
            );
          });
          if (ingId !== -1) acc[ingId].quantity += ingredient.quantity;
          else acc.push({ ...ingredient, repositioned: false });
        });
        return acc;
      },
      []
    );
    // console.log(totalIngredientsData);
    const sortedIngredients = [];
    this._tryToSortAnIngredient(totalIngredientsData, 0, sortedIngredients);
    // console.log(totalIngredientsData);
    return this._createCustomLengthIngredientsColumns(totalIngredientsData, 3);
  }
}

export default new shoppingListView();
