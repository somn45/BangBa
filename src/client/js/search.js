import 'regenerator-runtime';

const detailSearch = document.querySelector('.search__header').childNodes[0];
const searchHeaderText = document.querySelector('.search__header span');
const detailedSearchWrap = document.querySelector('.search__detail__wrap');
const detailedCheckBox = document.getElementById('detailedCheckBox');

let isOpened = false;

function handleClickDetailedSearch() {
  isOpened = !isOpened;
  if (isOpened) {
    detailedSearchWrap.classList.remove('hidden');
    detailedSearchWrap.classList.add('show');
    searchHeaderText.innerText = '▲ 상세 검색';
    detailedCheckBox.checked = true;
  } else {
    detailedSearchWrap.classList.remove('show');
    detailedSearchWrap.classList.add('hidden');
    searchHeaderText.innerText = '▼ 상세 검색';
    detailedCheckBox.checked = false;
  }
}

detailSearch.addEventListener('click', handleClickDetailedSearch);
