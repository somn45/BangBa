import { handleScore, countFilledScore } from './createComment';

const detailComments = document.querySelector('.detail__comments');

let commentObj;
let toggle = true;

async function handleClickModifyBtn(event) {
  const targetEl = event.target;
  if (targetEl.classList.contains('detail__comment__modify-btn') && toggle) {
    const commentEl = targetEl.parentNode.parentNode.parentNode;
    const commentSecondColumn = commentEl.querySelector(
      '.detail__comment__column__second'
    );
    const text = commentSecondColumn.firstChild.innerText;
    const commentScore = commentEl.querySelector('.detail__comment__score');
    commentScore.addEventListener('click', handleScore);
    const modifyArea = commentEl.querySelector('.detail__form--modify');
    const commentFirstColumn = {
      text,
      _id: commentEl.dataset.commentid,
    };
    commentObj = {
      commentFirstColumn,
      commentScore,
      commentSecondColumn,
      modifyArea,
    };

    startModifyComment(commentObj);
    toggle = !toggle;
  } else if (
    targetEl.classList.contains('detail__comment__modify-btn') &&
    !toggle
  ) {
    const { commentScore } = commentObj;
    commentScore.removeEventListener('click', handleScore);

    finishModifyComment(commentObj);
    toggle = !toggle;
  } else if (targetEl.classList.contains('detail__comment__modify-cancel')) {
    const { commentScore, modifyArea } = commentObj;

    cancelModifyComment(modifyArea);

    commentScore.removeEventListener('click', handleScore);
    toggle = !toggle;
  } else if (targetEl.classList.contains('detail__comment__delete')) {
    const commentEl = targetEl.parentNode;
    const commentList = commentEl.parentNode;
    const { commentid } = commentEl.dataset;
    const response = await fetch(`/comments/cafes/${commentid}/delete`, {
      method: 'DELETE',
    });
    if (response.status === 200) {
      commentList.removeChild(commentEl);
    }
  }
}

export function startModifyComment(commentObj) {
  const { commentSecondColumn, modifyArea } = commentObj;
  const span = commentSecondColumn.firstChild;
  const modifyTextarea = modifyArea.firstChild;
  const modifyBtn = event.target;
  const cancelModifyBtn = modifyBtn.nextSibling;
  modifyArea.classList.remove('hidden');
  modifyTextarea.innerText = span.innerText;
  modifyBtn.innerText = '수정 완료';
  cancelModifyBtn.classList.remove('hidden');
}

export async function finishModifyComment(commentObj) {
  const { commentFirstColumn, commentSecondColumn, commentScore, modifyArea } =
    commentObj;
  const modifyBtn = event.target;
  const cancelModifyBtn = modifyBtn.nextSibling;
  const span = commentSecondColumn.firstChild;
  const textarea = modifyArea.firstChild;
  const text = textarea.value;

  const score = countFilledScore(commentScore);
  await fetch(`/comments/cafes/${commentFirstColumn._id}/update`, {
    method: 'PATCH',
    body: JSON.stringify({ text, score }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  span.innerText = text;
  modifyBtn.innerText = '수정';
  modifyArea.classList.add('hidden');
  cancelModifyBtn.classList.add('hidden');
}

export function cancelModifyComment(modifyTextarea) {
  const cancelModifyBtn = event.target;
  const modifyBtn = cancelModifyBtn.previousSibling;
  modifyBtn.innerText = '수정';
  modifyTextarea.classList.add('hidden');
  cancelModifyBtn.classList.add('hidden');
}

detailComments.addEventListener('click', (event) =>
  handleClickModifyBtn(event)
);
