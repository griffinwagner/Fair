
//FOR NITRATE
(function() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var serverUrl = "/",
        members = [],
        pusher = new Pusher('b38925316396e9db8cca', {
          cluster: 'us2',
          encrypted: true
        }),
        channel,weatherChartRef;

    function showEle(elementId){
      document.getElementById(elementId).style.display = 'flex';
    }

    function hideEle(elementId){
      document.getElementById(elementId).style.display = 'none';
    }

    function ajax(url, method, payload, successCallback){
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        successCallback(xhr.responseText);
      };
      xhr.send(JSON.stringify(payload));
    }


   function renderWeatherChart(weatherData) {
      var ctx = document.getElementById("weatherChart").getContext("2d");
      var options = { };
      weatherChartRef = new Chart(ctx, {
        type: "line",
        data: weatherData,
        options: options
      });
  }

        var chartConfig = {
        labels: [],
        datasets: [
            {
                label: "Nitrate Level In Lagoon (mM)",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

  ajax("/getTemperatureSLE", "GET",{}, onFetchTempSuccess);

  function onFetchTempSuccess(response){
    hideEle("loader");
    var respData = JSON.parse(response);
    chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
    chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperature);
    renderWeatherChart(chartConfig)
  }

  channel = pusher.subscribe('london-temp-chart');
  channel.bind('new-temperature', function(data) {
    var newTempData = data.dataPoint;
    if(weatherChartRef.data.labels.length > 15){
      weatherChartRef.data.labels.shift();
      weatherChartRef.data.datasets[0].data.shift();
    }
    weatherChartRef.data.labels.push(newTempData.time);
    weatherChartRef.data.datasets[0].data.push(newTempData.temperature);
    weatherChartRef.update();
  });
// /* TEMP CODE FOR TESTING */
//   var dummyTime = 1500;
//   setInterval(function(){
//     dummyTime = dummyTime + 10;
//     ajax("/addTemperature?temperature="+ getRandomInt(10,20) +"&time="+dummyTime,"GET",{},() => {});
//   }, 0);
//
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
/* TEMP CODE ENDS */
})();

//FOR SalineUsing IIFE for Implementing Module Pattern to keep the Local Space for the JS Variables
(function() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var serverUrl = "/",
        members = [],
        pusher = new Pusher('b38925316396e9db8cca', {
          cluster: 'us2',
          encrypted: true
        }),
        channel, salineChartRef;

    function showEle(elementId){
      document.getElementById(elementId).style.display = 'flex';
    }

    function hideEle(elementId){
      document.getElementById(elementId).style.display = 'none';
    }

    function ajax(url, method, payload, successCallback){
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        successCallback(xhr.responseText);
      };
      xhr.send(JSON.stringify(payload));
    }


   function renderSalineChart(salineData) {
      var ctx = document.getElementById("salineChart").getContext("2d");
      var options = { };
      salineChartRef = new Chart(ctx, {
        type: "line",
        data: salineData,
        options: options
      });
  }

        var chartConfig = {
        labels: [],
        datasets: [
            {
                label: "Saline Level In Lagoon (ppt)",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

  ajax("/getSalineSLE", "GET",{}, onFetchSalineSuccess);

  function onFetchSalineSuccess(response){
    hideEle("loader2");
    var respData = JSON.parse(response);
    chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
    chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.saline);
    renderSalineChart(chartConfig)
  }

  channel = pusher.subscribe('salineLevelDataForGraph-chart');
  channel.bind('new-saline', function(data) {
    var newSalineData = data.dataPoint;
    if(salineChartRef.data.labels.length > 15){
      salineChartRef.data.labels.shift();
      salineChartRef.data.datasets[0].data.shift();
    }
    salineChartRef.data.labels.push(newSalineData.time);
    salineChartRef.data.datasets[0].data.push(newSalineData.saline);
    salineChartRef.update();
  });

  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
/* Saline CODE ENDS */

})();



//FOR THETEMP
(function() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var serverUrl = "/",
        members = [],
        pusher = new Pusher('b38925316396e9db8cca', {
          cluster: 'us2',
          encrypted: true
        }),
        channel, theTempChartRef;

    function showEle(elementId){
      document.getElementById(elementId).style.display = 'flex';
    }

    function hideEle(elementId){
      document.getElementById(elementId).style.display = 'none';
    }

    function ajax(url, method, payload, successCallback){
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        successCallback(xhr.responseText);
      };
      xhr.send(JSON.stringify(payload));
    }


   function rendertheTempChart(theTempData) {
      var ctx = document.getElementById("theTempChart").getContext("2d");
      var options = { };
      theTempChartRef = new Chart(ctx, {
        type: "line",
        data: theTempData,
        options: options
      });
  }

        var chartConfig3 = {
        labels: [],
        datasets: [
            {
                label: "Temperature Level In Lagoon (C)",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

  ajax("/gettheTempSLE", "GET",{}, onFetchtheTempSuccess);

  function onFetchtheTempSuccess(response){
    hideEle("loader3");
    var respData = JSON.parse(response);
    chartConfig3.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
    chartConfig3.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.theTemp);
    rendertheTempChart(chartConfig3)
  }

  channel = pusher.subscribe('theTempDataForGraph-chart');
  channel.bind('new-theTemp', function(data) {
    var newtheTempData = data.dataPoint;
    if(theTempChartRef.data.labels.length > 15){
      theTempChartRef.data.labels.shift();
      theTempChartRef.data.datasets[0].data.shift();
    }
    theTempChartRef.data.labels.push(newtheTempData.time);
    theTempChartRef.data.datasets[0].data.push(newtheTempData.theTemp);
    theTempChartRef.update();
  });

// /* Saline CODE FOR TESTING */
//   var dummyTime = 1500;
//   setInterval(function(){
//     dummyTime = dummyTime + 10;
//     ajax("/addTemperature?temperature="+ getRandomInt(10,20) +"&time="+dummyTime,"GET",{},() => {});
//   }, 0);
//
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
/* Saline CODE ENDS */

})();
