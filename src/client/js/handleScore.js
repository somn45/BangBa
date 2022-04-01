const scoreWrap = document.querySelector('.editable');
const starIcons = scoreWrap.querySelectorAll('.fa-star');

let finalScore;

function handleClickScoreWrap(event) {
  let targetEl = event.target;
  let score = 1;
  console.log(score);
  targetEl.classList.add('filled');
  for (let i = 0; i < 5; i++) {
    if (targetEl.previousSibling) {
      targetEl = targetEl.previousSibling;
      targetEl.classList.add('filled');
      score += 1;
    } else {
      break;
    }
  }
  for (let j = score; j < 5; j++) {
    starIcons[j].classList.remove('filled');
  }
  finalScore = score;
}

scoreWrap.addEventListener('click', handleClickScoreWrap);
