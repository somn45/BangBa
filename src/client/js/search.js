import 'regenerator-runtime';

const searchForm = document.querySelector('.search__form');
const detailSearch = document.querySelector('.search__header').childNodes[0];
const detailedSearchWrap = document.querySelector('.search__detail__wrap');
const detailedCheckBox = document.getElementById('detailedCheckBox');

let isOpened = false;

function handleClickDetailedSearch(event) {
  isOpened = !isOpened;
  if (isOpened) {
    detailedSearchWrap.classList.remove('hidden');
    detailedSearchWrap.classList.add('show');
    detailedCheckBox.checked = true;
  } else {
    detailedSearchWrap.classList.remove('show');
    detailedSearchWrap.classList.add('hidden');
    detailedCheckBox.checked = false;
  }
}

detailSearch.addEventListener('click', handleClickDetailedSearch);
