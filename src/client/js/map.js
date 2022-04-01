import 'regenerator-runtime';

const container = document.getElementById('map'); // 지도를 담을 영역
const select = document.querySelector('select');
const KAKAO_MAPS = kakao.maps;
let points = [];

const options = {
  // 지도를 생성할 때 필요한 기본 옵션
  center: new KAKAO_MAPS.LatLng(33.450701, 126.570667), // 지도의 중심 좌표
  level: 3, // 지도의 레벨(확대, 축소 정도)
};
const map = new KAKAO_MAPS.Map(container, options); // 지도 생성 및 객체 리턴
const geocoder = new KAKAO_MAPS.services.Geocoder();

async function handleChangeSelect(event) {
  points = [];
  const targetEl = event.target;
  const location = targetEl.value;

  const response = await fetch(`/api/search/map?location=${location}`, {
    method: 'get',
  });
  const { message, results } = await response.json();
  if (message.length !== 0) {
    return;
  }
  results.forEach((data) => setLatLng(data, results.length));
}

function setLatLng(data, length) {
  geocoder.addressSearch(data.location, function (result, status) {
    if (status === KAKAO_MAPS.services.Status.OK) {
      const point = {
        y: result[0].y,
        x: result[0].x,
        name: data.name,
        content: `<a href="/cafes/${data._id}" class="infowindow">${data.name}</a>`,
      };
      points = [...points, point];
      if (points.length === length) {
        resetMapRange(points);
      }
    }
  });
}

function resetMapRange(data) {
  const coords = points.map((point) => new KAKAO_MAPS.LatLng(point.y, point.x));

  // 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성
  const bounds = new KAKAO_MAPS.LatLngBounds();

  let i, marker;
  for (i = 0; i < coords.length; i++) {
    // 배열의 좌표들이 잘 보이게 마커를 지도에 추가
    marker = new KAKAO_MAPS.Marker({ position: coords[i] });
    marker.setMap(map);

    // LatLngBounds 객체에 좌표를 추가
    bounds.extend(coords[i]);

    const customOverlay = new KAKAO_MAPS.CustomOverlay({
      position: marker.getPosition(),
      content: data[i].content,
    });
    customOverlay.setMap(map, marker);
  }
  // LatLngBounds 객체에 추가된 좌표들을 기준으로 지도의 범위를 재설정
  map.setBounds(bounds);
}

select.addEventListener('change', handleChangeSelect);
