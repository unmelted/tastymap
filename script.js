
var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(37.54, 126.96), //지도의 중심좌표.
    level: 6//지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

let zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

const dataSet = [
    {
        title: "희락돈까스",
        address: "서울 영등포구 양산로 210",
        url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
        category: "양식",
    },
    {
        title: "즉석우동짜장",
        address: "서울 영등포구 대방천로 260",
        url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
        category: "한식",
    },
    {
        title: "아카사카",
        address: "서울 서초구 서초대로74길 23",
        url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
        category: "일식",
    },
];

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow, coords) {
    return function () {
        closeInfoWindow();
        infowindow.open(map, marker);
        map.panTo(coords);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function () {
        infowindow.close();
    };
}
let infowindowArray = [];
function closeInfoWindow() {
    for (infowindow of infowindowArray) {
        infowindow.close();
    }
}


var geocoder = new kakao.maps.services.Geocoder();
function getCoordsByAddress(address) {
    return new Promise((resolve, reject) => {
        geocoder.addressSearch(address, function (result, status) {
            if (status == kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                return resolve(coords);
            }
            reject(new Error("getCoordsByAddress Error: not valid Address"));
        });
    });
}

function getContents(data) {
    let videoId = "";
    let replaceUrl = data.url;
    replaceUrl = replaceUrl.replace("https://youtu.be/", "");
    replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
    replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
    videoId = replaceUrl.split("&")[0];

    //create info window
    return `<div class="infowindow">
        <div class="infowindow-img-container"><img src="https://img.youtube.com/vi/${videoId}/sddefault.jpg"
            class="infowindow-img">
        </div>
        <div class="infowindow-body">
            <h3 class="infowindow-title">${data.title}</h3>
            <p class="infowindow-adress">${data.address}</p>
            <a href="https://youtube.be/${data.url}" class="infowindow-btn" target="_blank">Video</a>
        </div>
    </div>`
}

var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
async function setMap() {
    for (var i = 0; i < dataSet.length; i++) {

        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new kakao.maps.Size(24, 35);
        // 마커 이미지를 생성합니다    
        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        let coords = await getCoordsByAddress(dataSet[i].address)
        console.log(dataSet[i].address, coords)
        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: coords
        });
        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: getContents(dataSet[i])
        });

        infowindowArray.push(infowindow);
        // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
        // 이벤트 리스너로는 클로저를 만들어 등록합니다 
        // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
        kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow, coords));
        kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
    }
}
setMap();