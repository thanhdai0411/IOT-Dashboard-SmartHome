const buttonToggle = document.querySelectorAll('.slider');
const stateDevice = document.querySelectorAll('.state_device');
const deviceContent = document.querySelectorAll('.device_content');

// chart

/*
/// theme chart
Highcharts.theme = {
    colors: [
        '#058DC7',
        '#50B432',
        '#ED561B',
        '#DDDF00',
        '#24CBE5',
        '#64E572',
        '#FF9655',
        '#FFF263',
        '#6AF9C4',
    ],
    chart: {
        backgroundColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
                [0, 'rgb(255, 255, 255)'],
                [1, 'rgb(240, 240, 255)'],
            ],
        },
    },
    title: {
        style: {
            color: '#000',
            font: 'bold 16px "Trebuchet MS", Verdana, sans-serif',
        },
    },
    subtitle: {
        style: {
            color: '#666666',
            font: 'bold 12px "Trebuchet MS", Verdana, sans-serif',
        },
    },
    legend: {
        itemStyle: {
            font: '9pt Trebuchet MS, Verdana, sans-serif',
            color: 'black',
        },
        itemHoverStyle: {
            color: 'gray',
        },
    },
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);
// end theme
*/
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
            // data: (function () {
            //     // generate an array of random data
            //     var data = [],
            //         time = new Date().getTime(),
            //         i;

            //     for (i = -9; i <= 0; i += 1) {
            //         data.push({
            //             x: time + i * 5000,
            //             y: 5,
            //         });
            //     }
            //     return data;
            // })(),
        },
    ],
});

chart_humidity = new Highcharts.Chart({
    chart: {
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
            // data: (function () {
            //     // generate an array of random data
            //     var data = [],
            //         time = new Date().getTime(),
            //         i;

            //     for (i = -9; i <= 0; i += 1) {
            //         data.push({
            //             x: time + i * 5000,
            //             y: 5,
            //         });
            //     }
            //     return data;
            // })(),
        },
    ],
});

chart_light = new Highcharts.Chart({
    chart: {
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
            // data: (function () {
            //     // generate an array of random data
            //     var data = [],
            //         time = new Date().getTime(),
            //         i;

            //     for (i = -9; i <= 0; i += 1) {
            //         data.push({
            //             x: time + i * 5000,
            //             y: 5,
            //         });
            //     }
            //     return data;
            // })(),
        },
    ],
});

chart_rain = new Highcharts.Chart({
    chart: {
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
    const point = [time, value];
    const series = chart.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart.series[0].addPoint(point, true, shift);
}

async function dataChartHumidity(value) {
    var time = new Date().getTime();
    const point = [time, value];
    const series = chart_humidity.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_humidity.series[0].addPoint(point, true, shift);
}

async function dataChartLight(value) {
    var time = new Date().getTime();
    const point = [time, value];
    const series = chart_light.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_light.series[0].addPoint(point, true, shift);
}

async function dataChartRain(value) {
    var time = new Date().getTime();
    const point = [time, value];
    const series = chart_rain.series[0],
        shift = series.data.length > 20; // shift if the series is longer than 20
    // // add the point
    chart_rain.series[0].addPoint(point, true, shift);
}

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

function isSuccessToast() {
    toast({
        header: 'Thành công',
        description: 'Chào mừng bạn vào nhà!',
        type: 'success',
        duration: 5000,
    });
}
function isWarnToast() {
    toast({
        header: 'Cảnh báo',
        description: 'Có người đột nhập!',
        type: 'warn',
        duration: 5000,
    });
}

// end toast message

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
            isWarnToast();
        } else if (parseInt(message.payloadString) == 1) {
            console.log('Chào mừng bạn vào nhà');
            isSuccessToast();
        }
    }

    //////////////////////////

    // if (message.destinationName == 'Data_sensor_node1_1') {
    //     dataChartTemperature(parseInt(message.payloadString));
    // } else if (message.destinationName == 'Data_sensor_node1_2') {
    //     dataChartHumidity(parseInt(message.payloadString));
    // }
}

function public(topic, data) {
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
            public('Data_control', 'OFF_' + index);
        } else {
            stateDevice[index].innerHTML = 'ON';
            public('Data_control', 'ON_' + index);
        }
    };
});
