import 'regenerator-runtime';

const detailContainer = document.querySelector('.detail__container');
const form = document.getElementById('commentForm');
const textarea = form.querySelector('textarea');
const button = form.querySelector('button');

const detailComments = document.querySelector('.detail__comments');

// 댓글 수정 시 보여줄 form 추가하기
let modifyForm = document.createElement('form');
const modifyFormClassList = ['detail__form--modify', 'hidden'];
modifyForm.classList.add(...modifyFormClassList);
const modifyTextarea = document.createElement('textarea');
modifyTextarea.setAttribute('cols', '30');
modifyTextarea.setAttribute('rows', '5');
modifyTextarea.placeholder =
  '수정하고 싶은 방탈출 카페의 후기, 댓글을 입력해주세요';
modifyForm.appendChild(modifyTextarea);

let toggle = true;
let commentObj;

detailComments.addEventListener('click', (event) =>
  handleClickModifyBtn(event)
);

async function handleClickModifyBtn(event) {
  const targetEl = event.target;
  if (targetEl.classList.contains('detail__comment__modify-btn') && toggle) {
    const commentEl = targetEl.parentNode.parentNode.parentNode;
    const commentText = commentEl.querySelector('.detail__comment__text');
    const span = commentText.firstChild;
    const modifyBtn = event.target;
    const cancelModifyBtn = modifyBtn.nextSibling;
    const modifyArea = commentEl.querySelector('.detail__form--modify');
    const modifyTextarea = modifyArea.firstChild;

    modifyArea.classList.remove('hidden');
    modifyTextarea.innerText = span.innerText;
    modifyBtn.innerText = '수정 완료';
    cancelModifyBtn.classList.remove('hidden');
    const text = commentText.firstChild.innerText;
    const commentInfo = {
      text,
      _id: commentEl.dataset.commentid,
    };
    commentObj = {
      commentInfo,
      commentText,
      modifyArea,
    };
    toggle = !toggle;
  } else if (
    targetEl.classList.contains('detail__comment__modify-btn') &&
    !toggle
  ) {
    const { commentInfo, commentText, modifyArea } = commentObj;
    const modifyBtn = event.target;
    const cancelModifyBtn = modifyBtn.nextSibling;
    const span = commentText.firstChild;
    const textarea = modifyArea.firstChild;
    const text = textarea.value;
    await fetch(`/comments/cafes/${commentInfo._id}/update`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    span.innerText = text;
    modifyBtn.innerText = '수정';
    modifyArea.classList.add('hidden');
    cancelModifyBtn.classList.add('hidden');
    toggle = !toggle;
  } else if (targetEl.classList.contains('detail__comment__modify-cancel')) {
    const { modifyArea } = commentObj;
    const cancelModifyBtn = event.target;
    const modifyBtn = cancelModifyBtn.previousSibling;
    modifyBtn.innerText = '수정';
    modifyArea.classList.add('hidden');
    cancelModifyBtn.classList.add('hidden');
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

function addComment(comment) {
  // 댓글을 담을 리스트 생성하기
  const newComment = document.createElement('li');
  newComment.setAttribute('data-commentid', comment._id);
  newComment.classList.add('detail__comment');

  // 댓글 정보 공간 생성하기
  const commentInfo = document.createElement('div');
  commentInfo.classList.add('detail__comment__info');
  const score = document.createElement('span');
  score.innerText = '평점';

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

  commentInfo.appendChild(score);
  commentInfo.appendChild(commentBtns);

  // 댓글 텍스트, 작성자가 포함된 공간 생성하기
  const commentText = document.createElement('div');
  commentText.classList.add('detail__comment__text');
  const span = document.createElement('span');
  span.innerText = comment.text;
  const commentOwner = document.createElement('a');
  commentOwner.setAttribute('href', `users/${comment.owner._id}`);
  commentOwner.innerText = comment.owner.uid;
  commentText.appendChild(span);
  commentText.appendChild(commentOwner);

  comment = {
    text: comment.text,
    _id: comment._id,
  };
  // 수정 버튼, 수정 취소 버튼에 이벤트 부여하기
  commentObj = {
    comment,
    commentBtns,
    commentElement: commentText,
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'X';
  deleteBtn.classList.add('detail__comment__delete');

  // 댓글 관련 모든 요소 부모와 연결하기
  newComment.appendChild(commentInfo);
  newComment.appendChild(commentText);
  newComment.appendChild(modifyForm);
  newComment.appendChild(deleteBtn);
  detailComments.prepend(newComment);
}

// 댓글 등록 버튼 클릭 시 일어나는 이벤트
async function handleSubmit(event) {
  event.preventDefault();
  const text = textarea.value;

  // 텍스트가 비어있을 경우 함수 건너뛰기
  if (text === '') {
    return;
  }

  // 댓글 텍스트 fetch하기
  const { cafeid } = detailContainer.dataset;
  const response = await fetch(`/comments/cafes/${cafeid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  // fetch된 오브젝트에서 commentId 가져오기
  const { comment } = await response.json();
  textarea.value = '';

  // fetch가 성공적으로 이루어졌을 경우 댓글 즉각적으로 추가
  if (response.status === 201) {
    addComment(comment);
  }
}

button.addEventListener('click', handleSubmit);
