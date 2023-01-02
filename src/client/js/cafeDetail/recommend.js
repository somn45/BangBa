const detailContainer = document.querySelector('.detail__container');
const recommendBox = document.querySelector('.detail__recommended-box');
const recommendBtn = recommendBox.querySelector('button');
const { cafeid } = detailContainer.dataset;

checkRecommendation();

async function checkRecommendation() {
  const response = await fetch(`/api/${cafeid}/recommend`, {
    method: 'GET',
  });
  if (response.status === 200) {
    recommendBtn.classList.add('recommended');
  }
}

async function handleRecommendBtn(event) {
  if (!recommendBtn.classList.contains('recommended')) {
    await fetch(`/api/${cafeid}/recommend/increase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    recommendBtn.classList.add('recommended');
  } else {
    await fetch(`/api/${cafeid}/recommend/decrease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    recommendBtn.classList.remove('recommended');
  }
}

recommendBtn.addEventListener('click', handleRecommendBtn);
