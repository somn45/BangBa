import 'regenerator-runtime';

const enterModalBtn = document.querySelector('.home__modal-btn');
const modalWrap = document.querySelector('.theme-modal__wrap');
const modalErrorMsg = modalWrap.querySelector('span');
const checkboxList = document.getElementsByName('theme');
const modalForm = modalWrap.querySelector('form');
const modalCloseBtn = modalWrap.querySelector('.theme-modal__close');

function handleClickEnterBtn(event) {
  modalWrap.classList.add('show');
  modalWrap.classList.remove('hidden');
}

async function handleSubmit(event) {
  event.preventDefault();
  let themeList = [];
  checkboxList.forEach((checkbox) => {
    if (checkbox.checked) {
      themeList.push(checkbox.defaultValue);
    }
  });
  if (themeList.length <= 0) {
    modalErrorMsg.innerText = '적어도 한가지의 테마를 지정해주셔야 합니다.';
    return;
  }
  const url = `/api/addWatchList`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ themeList }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 404) {
    modalErrorMsg.innerText = '로그인 한 유저만 관심테마를 설정할 수 있습니다.';
    return;
  }
  window.location.reload();
}

function handleClickCloseBtn(event) {
  modalWrap.classList.add('hidden');
  modalWrap.classList.remove('show');
}

enterModalBtn.addEventListener('click', handleClickEnterBtn);
modalForm.addEventListener('submit', handleSubmit);
modalCloseBtn.addEventListener('click', handleClickCloseBtn);
