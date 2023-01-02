const zipcode = document.querySelector('.form__zipcode');
const findZopcode = document.querySelector('.form__find-zipcode');
const addressEl = document.querySelector('.form__address');
const detailedAddress = document.querySelector('.form__detailed-address');
function execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      const { zonecode, address } = data;
      zipcode.value = zonecode;
      addressEl.value = address;
    },
  }).open();
}

findZopcode.addEventListener('click', execDaumPostcode);
detailedAddress.addEventListener('change', watchDetailedAddress);
