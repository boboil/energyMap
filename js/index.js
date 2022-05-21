let points = [];
let pointsHandler = [];

function parseJsaon() {
    getJSON('https://demonstration.org.ua/laravel/public/points-get',
        function (err, data) {
            if (err !== null) {
                return
            }
            pointsHandler = data
            initMap()
        });
}

function prepareTemplate(array) {
    points = [];
    array.forEach(point => {
        let workingTime = point.open247 ? '24/7' : 'не кргулосуточно';
        let description = `<div class="object" id="object">
    <div class="object-controls">
        <button class="object-edit">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 15.4601V18.5001C0 18.7801 0.22 19.0001 0.5 19.0001H3.54C3.67 19.0001 3.8 18.9501 3.89 18.8501L14.81 7.94006L11.06 4.19006L0.15 15.1001C0.0500001 15.2001 0 15.3201 0 15.4601ZM17.71 5.04006C18.1 4.65006 18.1 4.02006 17.71 3.63006L15.37 1.29006C14.98 0.900059 14.35 0.900059 13.96 1.29006L12.13 3.12006L15.88 6.87006L17.71 5.04006Z" fill="currentColor"/>
            </svg>

        </button>
        <button class="object-share">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.66 0.990044C16.02 -0.809956 12.76 0.0300438 11 2.09004C9.24 0.0300438 5.98 -0.819956 3.34 0.990044C1.94 1.95004 1.06 3.57004 1 5.28004C0.86 9.16004 4.3 12.27 9.55 17.04L9.65 17.13C10.41 17.82 11.58 17.82 12.34 17.12L12.45 17.02C17.7 12.26 21.13 9.15004 21 5.27004C20.94 3.57004 20.06 1.95004 18.66 0.990044ZM11.1 15.55L11 15.65L10.9 15.55C6.14 11.24 3 8.39004 3 5.50004C3 3.50004 4.5 2.00004 6.5 2.00004C8.04 2.00004 9.54 2.99004 10.07 4.36004H11.94C12.46 2.99004 13.96 2.00004 15.5 2.00004C17.5 2.00004 19 3.50004 19 5.50004C19 8.39004 15.86 11.24 11.1 15.55Z" fill="currentColor"/>
            </svg>
        </button>
    </div>
    <div class="object-power green">
        ${point.kvt} КВт
    </div>
    <div class="object-plugs">
        ${point.full_name}
    </div>
    <div class="object-title">
        ${point.name}
    </div>
    <div class="object-worktime">
        ${point.working_time}
    </div>
    <address class="object-address">
        ${point.address}
    </address>
    <a href="tel:${point.phone}" class="object-phone">
        ${point.phone}
    </a>
    <a href="https://maps.google.com/maps?daddr=50.94135,34.77725" target="_blank" class="object-roadmap">
        Проложить маршрут
    </a>
    <div class="object-availability">
        <div class="availability-item red">
            <div class="plug">
                <img src="images/station-icon.png" alt="" />
            </div>
            <div class="text">
                <div class="title">
                    Three Phase (EU) (currently same ID)
                </div>
                <div class="amount">
                    Станций: ${point.quantity}
                </div>
                <div class="power">
                    ${point.kvt}Квт
                </div>
            </div>
        </div>
    </div>
</div>`;
        points.push([{lat: parseFloat(point.latitude), lng: parseFloat(point.longitude)}, description])
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



    axios.get('https://demonstration.org.ua/laravel/public/points-get').then((response) => {
        pointsHandler = response.data;
        let array = [];
        pointsHandler.forEach(point => {
            if (paid && point.cost)
                array.push(point);

            if (fast && point.kvt > 40)
                array.push(point);

            if (unpaid && !point.cost)
                array.push(point);
        });
        pointsHandler = array;

        initMap()
    });
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
            label: ``,
            optimized: true,
        });

        // Add a click listener for each marker, and set up the info window.
        marker.addListener("click", () => {
            let describe = marker.title,
                block = document.getElementById('object');
            block.style.display = "block";
            block.innerHTML = describe

        });
    });
}