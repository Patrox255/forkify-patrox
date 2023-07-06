import icons from 'url:../../img/icons.svg';
import View from './View';
import { RES_PER_PAGE } from '../config';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn || btn.classList.contains('pagination__available_pages')) return;

      console.log(+btn.dataset.goto);
      handler(+btn.dataset.goto);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    console.log(this._data);
    const numPages = Math.ceil(
      this._data.results.length / this._data.resPerPage
    );
    console.log(numPages);
    const btnPrev = `
        <button class="btn--inline pagination__btn--prev ${
          (curPage === numPages && numPages > 1) ||
          (curPage > 1 && numPages > curPage)
            ? ''
            : 'hidden'
        }" data-goto="${curPage - 1}">
        <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${curPage - 1}</span>
        </button>
    `;
    const btnNext = `
        <button class="btn--inline pagination__btn--next ${
          (curPage === 1 && numPages > 1) || (curPage > 1 && numPages > curPage)
            ? ''
            : 'hidden'
        }" data-goto="${curPage + 1}">
        <span>Page ${curPage + 1}</span>
        <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
        </svg>
        </button>
    `;
    const availableSitesBtn = `
      <button class="btn--inline pagination__available_pages"
      <span>Available pages: ${numPages}</span>
      </button>
    `;

    return btnPrev + availableSitesBtn + btnNext;
    // Page 1, and there are other pages
    // if (curPage === 1 && numPages > 1) {
    //   return btnNext;
    // }
    // // Last page
    // if (curPage === numPages && numPages > 1) {
    //   return btnPrev;
    // }
    // // Other page
    // if (curPage > 1 && curPage < numPages) {
    //   return btnPrev + btnNext;
    // }
    // // Page 1, and there aren't other pages
    // return availableSitesBtn;
  }
}

export default new PaginationView();
