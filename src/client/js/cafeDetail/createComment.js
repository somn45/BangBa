import 'regenerator-runtime';

const detailContainer = document.querySelector('.detail__container');
const form = document.getElementById('commentForm');
const addCommentErrorMsg = form.querySelector('span');
const textarea = form.querySelector('textarea');
const button = form.querySelector('button');
const detailComments = document.querySelector('.detail__comments');
const scoreContainer = document.querySelector('.detail__score');

function addComment(comment, score) {
  // 댓글을 담을 리스트 생성하기
  const newComment = document.createElement('li');
  newComment.setAttribute('data-commentid', comment._id);
  newComment.classList.add('detail__comment');

  // 댓글 정보 공간 생성하기
  const commentFirstColumn = document.createElement('div');
  commentFirstColumn.classList.add('detail__comment__column__first');

  const commentScore = document.createElement('div');
  commentScore.classList.add('detail__comment__score');
  fillScore(commentScore, score);

  // 댓글 수정 버튼을 생성하고 부모에 포함시키기
  const commentBtns = document.createElement('div');
  commentBtns.classList.add('detail__comment__btns');
  const modifyBtn = document.createElement('button');
  modifyBtn.innerText = '수정';
  modifyBtn.classList.add('detail__comment__modify-btn');
  const cancelModifyBtn = document.createElement('button');
  cancelModifyBtn.innerText = '취소';
  cancelModifyBtn.classList.add('detail__comment__modify-cancel');
  cancelModifyBtn.classList.add('hidden');
  commentBtns.appendChild(modifyBtn);
  commentBtns.appendChild(cancelModifyBtn);
  commentFirstColumn.appendChild(commentScore);
  commentFirstColumn.appendChild(commentBtns);

  // 댓글 텍스트, 작성자가 포함된 공간 생성하기
  const commentSecondColumn = document.createElement('div');
  commentSecondColumn.classList.add('detail__comment__column__second');
  const span = document.createElement('span');
  span.innerText = comment.text;
  const commentOwner = document.createElement('a');
  commentOwner.setAttribute('href', `users/${comment.owner._id}`);
  commentOwner.innerText = comment.owner.uid;
  commentSecondColumn.appendChild(span);
  commentSecondColumn.appendChild(commentOwner);

  // 댓글 삭제 버튼 생성하기
  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'X';
  deleteBtn.classList.add('detail__comment__delete');

  // 댓글 수정, 삭제 기능에 쓰일 정보들 저장하기
  comment = {
    text: comment.text,
    _id: comment._id,
  };

  // 댓글 수정 시 보여줄 form 추가하기
  const modifyForm = document.createElement('form');
  const modifyFormClassList = ['detail__form--modify', 'hidden'];
  modifyForm.classList.add(...modifyFormClassList);
  const modifyTextarea = document.createElement('textarea');
  modifyTextarea.setAttribute('cols', '30');
  modifyTextarea.setAttribute('rows', '5');
  modifyTextarea.placeholder =
    '수정하고 싶은 방탈출 카페의 후기, 댓글을 입력해주세요';
  modifyForm.appendChild(modifyTextarea);

  // 댓글 관련 모든 요소 부모와 연결하기
  newComment.appendChild(commentFirstColumn);
  newComment.appendChild(commentSecondColumn);
  newComment.appendChild(modifyForm);
  newComment.appendChild(deleteBtn);
  detailComments.prepend(newComment);
}

// 댓글 등록 버튼 클릭 시 일어나는 이벤트
async function handleSubmit(event) {
  event.preventDefault();
  const text = textarea.value;
  const scoreErrorMsg = document.querySelector('.detail__score__message');
  const score = countFilledScore(scoreContainer);

  // 텍스트가 비어있을 경우 함수 건너뛰기
  if (text === '') {
    return;
  } else if (!score) {
    scoreErrorMsg.innerText = '댓글 작성 시 평가점수를 입력해야 합니다.';
    return;
  }
  scoreErrorMsg.innerText = '';

  // 댓글 텍스트 fetch하기
  const { cafeid } = detailContainer.dataset;
  try {
    const response = await fetch(`/comments/cafes/${cafeid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, score }),
    });

    // fetch가 성공적으로 이루어졌을 경우 댓글 즉각적으로 추가
    const { comment } = await response.json();
    textarea.value = '';
    addComment(comment, score);
  } catch (error) {
    console.error(error);
    addCommentErrorMsg.innerText = '게스트 유저는 댓글 작성이 불가능합니다.';
  }
}

function fillScore(scoreContext, score) {
  for (let i = 0; i < score; i++) {
    const filledScore = document.createElement('i');
    const filledScoreClassList = ['fa-solid', 'fa-star', 'filled'];
    filledScore.classList.add(...filledScoreClassList);
    scoreContext.appendChild(filledScore);
  }
  for (let j = score; j < 5; j++) {
    const score = document.createElement('i');
    const scoreClassList = ['fa-solid', 'fa-star'];
    score.classList.add(...scoreClassList);
    scoreContext.appendChild(score);
  }
}

export function handleScore(event) {
  let targetEl = event.target;
  let previousTarget = targetEl.previousSibling;
  let nextTarget = targetEl.nextSibling;
  let filledStar = 0;
  targetEl.classList.add('filled');
  for (let i = 0; i < 5; i++) {
    if (previousTarget) {
      previousTarget.classList.add('filled');
      previousTarget = previousTarget.previousSibling;
      filledStar += 1;
    } else {
      break;
    }
  }
  for (let j = filledStar; j < 5; j++) {
    if (nextTarget) {
      nextTarget.classList.remove('filled');
      nextTarget = nextTarget.nextSibling;
    }
  }
}

export function countFilledScore(scoreElement) {
  const filledScore = scoreElement.querySelectorAll('.filled');
  return filledScore.length;
}

scoreContainer.addEventListener('click', handleScore);
button.addEventListener('click', handleSubmit);
