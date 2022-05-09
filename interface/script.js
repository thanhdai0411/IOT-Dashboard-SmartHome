const buttonToggle = document.querySelectorAll('.slider');
const stateDevice = document.querySelectorAll('.state_device');
const deviceContent = document.querySelectorAll('.device_content');

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';

const firebaseConfig = {
    apiKey: 'AIzaSyDGgnb24aRVuLa2kVq1k1hgKHnfnArXXl8',
    authDomain: 'iotproject-fc1af.firebaseapp.com',
    databaseURL:
        'https://iotproject-fc1af-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'iotproject-fc1af',
    storageBucket: 'iotproject-fc1af.appspot.com',
    messagingSenderId: '1092610695725',
    appId: '1:1092610695725:web:55d3fcc2a200ecacc24ea4',
    measurementId: 'G-DY5FS87VWG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserSessionPersistence,
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const provider = new GoogleAuthProvider();
const auth = getAuth();

// toast message

function toast({ header = '', description = '', type = '', duration = 3000 }) {
    var main = document.querySelector('.toast-container');
    if (main) {
        // tạo một thẻ div ở trong  main
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast--${type}`);

        //auto xoa toast
        const autoRemove = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        // click xoa toast
        toast.onclick = function (e) {
            if (e.target.closest('.toast__icon-close')) {
                main.removeChild(toast);
                clearTimeout(autoRemove);
            }
        };

        const icons = {
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle',
            warn: 'fas fa-exclamation-circle',
        };
        // lấy ra icon tương ứng với type
        const icon = icons[type];

        const delay = (duration / 1000).toFixed(2);

        toast.style.animation = `slideInLeft ease-in-out .3s, fadeOut linear 1s ${delay}s forwards`;

        // Viết vào thẻ div đã add thêm class
        toast.innerHTML = `
            <div class="toast__icon toast__icon-${type}">
                <i class="${icon}"></i>
            </div>  
            <div class="toast__content">
                <h3 class="toast__header">${header}</h3>
                
                <p class="toast__ders">${description} </p>
            </div>
            <div class="toast__icon toast__icon-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        // nối  toast mới ghi vào - > class toast-container
        main.appendChild(toast);
    }
}

function isSuccessToast(header, description, duration) {
    toast({
        header: header,
        description: description,
        type: 'success',
        duration: duration,
    });
}
function isWarnToast(header, description, duration) {
    // toast({
    //     header: 'Cảnh báo',
    //     description: 'Có người đột nhập!',
    //     type: 'warn',
    //     duration: 5000,
    // });
    toast({
        header: header,
        description: description,
        type: 'warn',
        duration: duration,
    });
}
function isInfoToast() {
    toast({
        header: 'Lỗi !!!',
        description: 'Nhập sai thông tin ! Xin nhập lại',
        type: 'info',
        duration: 2000,
    });
    // toast({
    //     header: header,
    //     description: description,
    //     type: 'info',
    //     duration: duration,
    // });
}

// end toast message

// loggin

const btnRegister = document.querySelector('.btn_register');
const loginForm = document.querySelector('.login_form');
const registerForm = document.querySelector('.register_form');
const btnCreateAccount = document.querySelector('.btn_create_account');
const btnLogin = document.querySelector('.btn_login');
const buttonGG = document.querySelector('.google');
const inputUsername = document.querySelector('.input_username');
const inputEmail = document.querySelector('.input_email');
const inputPWD = document.querySelector('.input_pwd');

const inputLoginEmail = document.querySelector('.input_login_email');
const inputLoginPWD = document.querySelector('.input_login_pwd');
const inputImg = document.querySelector('.input_img');
const opacity = document.querySelector('.opacity');

const mainPage = document.querySelector('.main');
const btnLogOut = document.querySelector('.log_out');

const nameUser = document.querySelector('.name_user');
const title_dashboard = document.querySelector('.title_dashboard');
const avtUser = document.querySelector('.avt-user');

const authSuccess = () => {
    mainPage.style.display = 'block';
    loginForm.style.display = 'none';
    opacity.style.display = 'none';
};

const authFail = () => {
    mainPage.style.display = 'none';
    loginForm.style.display = 'block';
    opacity.style.display = 'block';
};

auth.onAuthStateChanged(function (user) {
    if (user) {
        authSuccess();
        console.log('User login: ', user.displayName);
        nameUser.innerHTML = user.displayName;
        title_dashboard.innerHTML = `Hey ! ${user.displayName}`;
        if (user.photoURL != null) avtUser.src = user.photoURL;
    }
});

btnRegister.onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
};

btnCreateAccount.onclick = () => {
    createUserWithEmailAndPassword(auth, inputEmail.value, inputPWD.value)
        .then((userCredential) => {
            // Signed in

            updateProfile(auth.currentUser, {
                displayName: inputUsername.value,
            })
                .then(() => {
                    // alert('Dang k itahnh cong');
                    isSuccessToast('Thành Công', 'Đăng ký thành công', 3000);
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';

                    // ...
                })
                .catch((error) => {
                    isWarnToast('Thất Bại', 'Đăng ký thất bại', 3000);
                    alert(error.message);
                });
        })
        .catch((error) => {
            // alert(error.message);
        });
};
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
    });
buttonGG.onclick = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            isSuccessToast('Thành Công', 'Đăng nhập thành công', 3000);

            const user = result.user;
            console.log(user);
            authSuccess();
            // const name = localStorage.getItem('user');
            nameUser.innerHTML = user.displayName;
            title_dashboard.innerHTML = `Hey ! ${user.displayName}`;
            avtUser.src = user.photoURL;
            // ...
        })
        .catch((error) => {
            isWarnToast('Thất Bại', 'Đăng nhập không thành công', 3000);
        });
};

btnLogin.onclick = () => {
    signInWithEmailAndPassword(auth, inputLoginEmail.value, inputLoginPWD.value)
        .then((result) => {
            console.log('dang nhap thanh cog');
            isSuccessToast('Thành Công', 'Đăng nhập thành công', 3000);
            const user = result.user;
            localStorage.setItem('user', user.displayName);
            authSuccess();
            nameUser.innerHTML = user.displayName;
            title_dashboard.innerHTML = `Hey ! ${user.displayName}`;

            // ...
        })
        .catch((error) => {
            console.log('dang nhap that bai');
            isWarnToast('Thất Bại', 'Đăng nhập không thành công', 3000);
            // const errorCode = error.code;
            // const errorMessage = error.message;
        });
};

btnLogOut.onclick = () => {
    signOut(auth)
        .then(() => {
            authFail();
        })
        .catch((error) => {
            // An error happened.
        });
};

// end loggin

// load-info-user

// end load-info-user
// chart

/// theme chart
Highcharts.theme = {
    colors: [
        '#2b908f',
        '#90ee7e',
        '#f45b5b',
        '#7798BF',
        '#aaeeee',
        '#ff0066',
        '#eeaaee',
        '#55BF3B',
        '#DF5353',
        '#7798BF',
        '#aaeeee',
    ],
    chart: {
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40'],
            ],
        },
        style: {
            fontFamily: "'Unica One', sans-serif",
        },
        plotBorderColor: '#606063',
    },
    title: {
        style: {
            color: '#E0E0E3',
            // textTransform: 'uppercase',
            fontSize: '20px',
        },
    },
    subtitle: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase',
        },
    },
    xAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3',
            },
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
            style: {
                color: '#A0A0A3',
            },
        },
    },
    yAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3',
            },
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
            style: {
                color: '#A0A0A3',
            },
        },
    },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0',
        },
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#F0F0F3',
                style: {
                    fontSize: '13px',
                },
            },
            marker: {
                lineColor: '#333',
            },
        },
        boxplot: {
            fillColor: '#505053',
        },
        candlestick: {
            lineColor: 'white',
        },
        errorbar: {
            color: 'white',
        },
    },
    legend: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        itemStyle: {
            color: '#E0E0E3',
        },
        itemHoverStyle: {
            color: '#FFF',
        },
        itemHiddenStyle: {
            color: '#606063',
        },
        title: {
            style: {
                color: '#C0C0C0',
            },
        },
    },
    credits: {
        style: {
            color: '#666',
        },
    },
    labels: {
        style: {
            color: '#707073',
        },
    },
    drilldown: {
        activeAxisLabelStyle: {
            color: '#F0F0F3',
        },
        activeDataLabelStyle: {
            color: '#F0F0F3',
        },
    },
    navigation: {
        buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: '#505053',
            },
        },
    },
    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC',
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                        color: 'white',
                    },
                },
                select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                        color: 'white',
                    },
                },
            },
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver',
        },
        labelStyle: {
            color: 'silver',
        },
    },
    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA',
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED',
        },
        xAxis: {
            gridLineColor: '#505053',
        },
    },
    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043',
    },
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);
// end theme

let chart, chart_humidity, chart_light, chart_rain;

chart = new Highcharts.Chart({
    chart: {
        spacingRight: 30,
        spacingTop: 20,
        renderTo: 'container_temp',
        defaultSeriesType: 'spline',
        events: {
            load: dataChartTemperature,
        },
    },
    time: {
        useUTC: false,
    },
    title: {
        text: 'Temperature',
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000,
    },
    yAxis: {
        title: {
            text: null,
        },
        labels: {
            formatter: function () {
                return this.value;
            },
        },
    },
    tooltip: {
        crosshairs: true,
        shared: true,
    },

    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        borderWidth: 0,
    },
    accessibility: {
        announceNewData: {
            enabled: true,
            minAnnounceInterval: 15000,
            announcementFormatter: function (allSeries, newSeries, newPoint) {
                if (newPoint) {
                    return 'New point added. Value: ' + newPoint.y;
                }
                return false;
            },
        },
    },

    exporting: {
        enabled: false,
    },
    series: [
        {
            name: 'Temperature',
            data: [],
            color: {
                radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
                stops: [
                    [0, '#003399'],
                    [1, '#3366AA'],
                ],
            },
        },
    ],
});

chart_humidity = new Highcharts.Chart({
    chart: {
        spacingRight: 30,
        spacingTop: 20,
        renderTo: 'container_humi',
        defaultSeriesType: 'spline',
        events: {
            load: dataChartTemperature,
        },
    },
    time: {
        useUTC: false,
    },
    title: {
        text: 'Humidity',
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000,
    },
    yAxis: {
        title: {
            text: null,
        },
        labels: {
            formatter: function () {
                return this.value;
            },
        },
    },
    tooltip: {
        crosshairs: true,
        shared: true,
    },

    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        borderWidth: 0,
    },
    accessibility: {
        announceNewData: {
            enabled: true,
            minAnnounceInterval: 15000,
            announcementFormatter: function (allSeries, newSeries, newPoint) {
                if (newPoint) {
                    return 'New point added. Value: ' + newPoint.y;
                }
                return false;
            },
        },
    },

    exporting: {
        enabled: false,
    },
    series: [
        {
            name: 'Humidity',
            data: [],
        },
    ],
});

chart_light = new Highcharts.Chart({
    chart: {
        spacingRight: 30,
        spacingTop: 20,
        renderTo: 'container_light',
        defaultSeriesType: 'spline',
        events: {
            load: dataChartLight,
        },
    },
    time: {
        useUTC: false,
    },
    title: {
        text: 'Light Sensor',
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000,
    },
    yAxis: {
        title: {
            text: null,
        },
        labels: {
            formatter: function () {
                return this.value;
            },
        },
    },
    tooltip: {
        crosshairs: true,
        shared: true,
    },

    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        borderWidth: 0,
    },
    accessibility: {
        announceNewData: {
            enabled: true,
            minAnnounceInterval: 15000,
            announcementFormatter: function (allSeries, newSeries, newPoint) {
                if (newPoint) {
                    return 'New point added. Value: ' + newPoint.y;
                }
                return false;
            },
        },
    },

    exporting: {
        enabled: false,
    },
    series: [
        {
            name: 'Light Sensor',
            data: [],
        },
    ],
});

chart_rain = new Highcharts.Chart({
    chart: {
        spacingRight: 30,
        spacingTop: 20,
        renderTo: 'container_rain',
        defaultSeriesType: 'spline',
        events: {
            load: dataChartRain,
        },
    },
    time: {
        useUTC: false,
    },
    title: {
        text: 'Rain Sensor',
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000,
    },
    yAxis: {
        title: {
            text: null,
        },
        labels: {
            formatter: function () {
                return this.value;
            },
        },
    },
    tooltip: {
        crosshairs: true,
        shared: true,
    },

    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        borderWidth: 0,
    },

    exporting: {
        enabled: false,
    },
    series: [
        {
            name: 'Rain Sensor',
            data: [],
        },
    ],
});

////////////////////////////////////

async function dataChartTemperature(value) {
    var time = new Date().getTime();
    const point = await [time, value];
    const series = chart.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart.series[0].addPoint(point, true, shift);
}

async function dataChartHumidity(value) {
    var time = new Date().getTime();
    const point = await [time, value];
    const series = chart_humidity.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_humidity.series[0].addPoint(point, true, shift);
}

async function dataChartLight(value) {
    var time = new Date().getTime();
    const point = await [time, value];
    const series = chart_light.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_light.series[0].addPoint(point, true, shift);
}

async function dataChartRain(value) {
    var time = new Date().getTime();
    const point = await [time, value];
    const series = chart_rain.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_rain.series[0].addPoint(point, true, shift);
}

// mqtt

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var client = new Paho.MQTT.Client('broker.hivemq.com', 8000, makeid());

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

var options = {
    useSSL: false,
    userName: '',
    password: '',
    onSuccess: onConnect,
    onFailure: doFail,
};

console.log('Connect to broker.hivemq.com:8000');
// connect the client
client.connect(options);

function doFail(e) {
    console.log(e);
}

function onConnect() {
    //sự kiên kết nối thành công
    console.log('Connect succesful');

    // client.subscribe('Data_sensor_node1_1');
    // client.subscribe('Data_sensor_node1_2');
    // client.subscribe('Data_sensor_node2');
    // client.subscribe('Data_esp_node3');

    client.subscribe('Data_sensor_humi');
    client.subscribe('Data_sensor_temp');
    client.subscribe('Data_sensor_rain');
    client.subscribe('Data_sensor_light');
    client.subscribe('Data_esp');
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    console.log('>>>>>>>>>  ' + message.destinationName + ': ' + message.payloadString);

    //__________________________

    if (message.destinationName == 'Data_sensor_temp') {
        dataChartTemperature(parseInt(message.payloadString));
    } else if (message.destinationName == 'Data_sensor_humi') {
        dataChartHumidity(parseInt(message.payloadString));
    } else if (message.destinationName == 'Data_sensor_light') {
        dataChartLight(parseInt(message.payloadString));
    } else if (message.destinationName == 'Data_sensor_rain') {
        dataChartRain(parseInt(message.payloadString));
    } else if (message.destinationName == 'Data_esp') {
        console.log('ESP Control');
        if (parseInt(message.payloadString) == 2) {
            console.warn('Có người cố ý muốn vào nhà !!');
            isWarnToast('Cảnh báo', 'Có người cố ý muốn vào nhà', 5000);
        } else if (parseInt(message.payloadString) == 1) {
            console.log('Chào mừng bạn vào nhà');
            isSuccessToast('Thành Công', 'Chào mừng bạn vào nhà', 5000);
        }
    }

    //////////////////////////

    // if (message.destinationName == 'Data_sensor_node1_1') {
    //     dataChartTemperature(parseInt(message.payloadString));
    // } else if (message.destinationName == 'Data_sensor_node1_2') {
    //     dataChartHumidity(parseInt(message.payloadString));
    // }
}

function public_message(topic, data) {
    message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    client.send(message);
}

///

buttonToggle.forEach((item, index) => {
    item.onclick = (e) => {
        deviceContent[index].classList.toggle('disabled');
        if (deviceContent[index].classList.contains('disabled')) {
            stateDevice[index].innerHTML = 'OFF';
            public_message('Data_control', 'OFF_' + index);
        } else {
            stateDevice[index].innerHTML = 'ON';
            public_message('Data_control', 'ON_' + index);
        }
    };
});
