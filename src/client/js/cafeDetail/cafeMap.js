import 'regenerator-runtime';

const KAKAO_MAPS = kakao.maps;
const cafeContainer = document.querySelector('.detail__container');
const mapContainer = document.getElementById('map');
const mapOption = {
  center: new KAKAO_MAPS.LatLng(33.450701, 126.570657),
  level: 3,
};

const map = new KAKAO_MAPS.Map(mapContainer, mapOption);
const geocoder = new KAKAO_MAPS.services.Geocoder();
const { cafeid } = cafeContainer.dataset;
setMarker();

async function setMarker() {
  const { cafe } = await (await fetch(`/api/${cafeid}/getInfo`)).json();
  geocoder.addressSearch(cafe.location, function (result, status) {
    if (status === KAKAO_MAPS.services.Status.OK) {
      const coords = new KAKAO_MAPS.LatLng(result[0].y, result[0].x);
      const marker = new KAKAO_MAPS.Marker({
        map,
        position: coords,
      });

      const customOverlay = new KAKAO_MAPS.CustomOverlay({
        content: `<div class="infowindow">${cafe.name}</a>`,
        position: coords,
      });
      customOverlay.setMap(map, marker);
      map.setCenter(coords);
    }
  });
}
