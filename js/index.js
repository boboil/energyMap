let points = [];
let pointsHandler = [];

function parseJsaon() {
    getJSON('/json/fullData.json',
        function (err, data) {
            if (err !== null) {
                return
            }
            console.log(data)
            pointsHandler = data

        });
}
function prepareTemplate(array) {
    points = [];
    array.forEach(point => {
        let workingTime = point.open247 ? '24/7' : 'не кргулосуточно';
        let description = `<div class="filter-top">
                    <div class="info-top">
                        <div class="hug-left">
                                <span class="green-hug">
                                    ${point.kvt} КВт
                                </span>
                        </div>
                        <div class="hug-right">

                        </div>
                    </div>
                    <div class="address-top">
                        <span>${point.poi_name}</span>
                    </div>
                    <div class="working-block">
                        <h2>${point.name}</h2>
                        <div class="working-time">
                                <span>${workingTime}</span>
                        </div>
                    </div>
                    <div class="working-address">
                        <span>${point.address}</span>
                        <span>${point.phone}</span>
                    </div>
                    <div class="road-link">
                        <a href="${point.url}">Проложить маршрут</a>
                    </div>
                    <div class="cost-block">
                        <p>Стоимость 2500₽/Квт</p>
                        <p>Стоимость 2500₽/Квт</p>
                        <p>Стоимость 2500₽/Квт</p>
                    </div>
                    <div class="active-block">
                        <span>${point.description}</span>
                    </div>
                    <div class="station-info">
                        <img src="./images/station-icon.png" alt="station-icon" class="station-img">
                        <div class="id-info"><span>Three Phase (EU) (currently same ID)</span>
                            <div class="count-info">Станций: ${point.valid_outlets.length} <span> ${point.kvt}Квт</span></div>
                        </div>
                    </div>
                </div>`;
        points.push([{lat: point.latitude, lng: point.longitude}, description])
    })

}
function filterPoints(elem) {

    let paid = false, unpaid = false, fast = false, phase = false;
    if (elem.name === 'paid' && elem.value === 'on')
        paid = true;
    if (elem.name === 'unPaid' && elem.value === 'on')
        unpaid = true;
    if (elem.name === 'fast' && elem.value === 'on')
        fast = true;
    if (elem.name === 'phase' && elem.value === 'on')
        phase = true;


    // parseJsaon();

    axios.get('/json/fullData.json').then((response) => {
        pointsHandler = response.data;
        let array = [];
        pointsHandler.forEach(point => {
            if (paid && point.cost)
                array.push(point);

            if (fast && point.kvt > 0)
                array.push(point);

            if (unpaid && !point.cost)
                array.push(point);
        });
        pointsHandler = array;

        initMap()
    }).then(response => response.json()).then(json => saveAs(
        new Blob(
            [JSON.stringify(json, null, 2)],
            {type: "application/json;charset=" + document.characterSet}
        ), "doc.json");
}



let getJSON = function (url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

parseJsaon();


let activeInfoWindow;
let markers = [];

function initMap() {
    prepareTemplate(pointsHandler)
    let opt = {
        center: {lat: 44.58643148068905, lng: 33.49257426439605},
        zoom: 7,
        maxZoom: 13,
        minZoom: 6,
        disableDefaultUI: true,
        gestureHandling: 'greedy',

    };


    var map = new google.maps.Map(document.getElementById('map'), opt);
    const image = {
        url: "http://demonstration.org.ua/images/small.png",
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(60, 85),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32),
    };
    // Create an info window to share between markers.
    const infoWindow = new google.maps.InfoWindow();

    // Create the markers.
    points.forEach(([position, title], i) => {
        const marker = new google.maps.Marker({
            position,
            map,
            icon: image,
            title: `${title}`,
            // label: `${i + 1}`,
            optimized: false,
        });

        // Add a click listener for each marker, and set up the info window.
        marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(marker.getTitle());
            infoWindow.open(marker.getMap(), marker);
        });
    });
}