
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
        channel,weatherForSearchChartRef;

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


   function renderWeatherChart(weatherForSearchData) {
      var ctx = document.getElementById("weatherForSearchChart").getContext("2d");
      var options = { };
      weatherForSearchChartRef = new Chart(ctx, {
        type: "line",
        data: weatherForSearchData,
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

  ajax("/getTemperatureForSearchVB", "GET",{}, onFetchTempSuccess);

  function onFetchTempSuccess(response){
    hideEle("loaderForSearch");
    var respData = JSON.parse(response);
    chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.timeForSearch);
    chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperatureForSearch);
    renderWeatherChart(chartConfig)
  }

  channel = pusher.subscribe('london-tempForSearch-chart');
  channel.bind('new-temperatureForSearch', function(data) {
    var newTempData = data.dataPoint;
    if(weatherForSearchChartRef.data.labels.length > 15){
      weatherForSearchChartRef.data.labels.shift();
      weatherForSearchChartRef.data.datasets[0].data.shift();
    }
    weatherForSearchChartRef.data.labels.push(newTempData.timeForSearch);
    weatherForSearchChartRef.data.datasets[0].data.push(newTempData.temperatureForSearch);
    weatherForSearchChartRef.update();
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

//saline
(function() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var serverUrl = "/",
        members = [],
        pusher = new Pusher('b38925316396e9db8cca', {
          cluster: 'us2',
          encrypted: true
        }),
        channel, salineForSearchChartRef;

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


   function renderSalineChart(salineForSearchData) {
      var ctx = document.getElementById("salineForSearchChart").getContext("2d");
      var options = { };
      salineForSearchChartRef = new Chart(ctx, {
        type: "line",
        data: salineForSearchData,
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

  ajax("/getSalineForSearchVB", "GET",{}, onFetchSalineSuccess);

  function onFetchSalineSuccess(response){
    hideEle("loader2");
    var respData = JSON.parse(response);
    chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.timeForSearch);
    chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.salineForSearch);
    renderSalineChart(chartConfig)
  }

  channel = pusher.subscribe('salineLeveForSearchlDataForGraph-chart');
  channel.bind('new-salineForSearch', function(data) {
    var newSalineForSearchData = data.dataPoint;
    if(salineForSearchChartRef.data.labels.length > 15){
      salineForSearchChartRef.data.labels.shift();
      salineForSearchChartRef.data.datasets[0].data.shift();
    }
    salineForSearchChartRef.data.labels.push(newSalineData.time);
    salineForSearchChartRef.data.datasets[0].data.push(newSalineData.saline);
    salineForSearchChartRef.update();
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
        channel, theTempForSearchChartRef;

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


   function rendertheTempChart(theTempForSearchData) {
      var ctx = document.getElementById("theTempForSearchChart").getContext("2d");
      var options = { };
      theTempChartRef = new Chart(ctx, {
        type: "line",
        data: theTempForSearchData,
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

  ajax("/gettheTempForSearchVB", "GET",{}, onFetchtheTempSuccess);

  function onFetchtheTempSuccess(response){
    hideEle("loader3ForSearch");
    var respData = JSON.parse(response);
    chartConfig3.labels = respData.dataPoints.map(dataPoint => dataPoint.timeForSearch);
    chartConfig3.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.theTempForSearch);
    rendertheTempChart(chartConfig3)
  }

  channel = pusher.subscribe('theTempForSearchDataForGraph-chart');
  channel.bind('new-theTempForSearch', function(data) {
    var newtheTempData = data.dataPoint;
    if(theTempForSearchChartRef.data.labels.length > 15){
      theTempForSearchChartRef.data.labels.shift();
      theTempForSearchChartRef.data.datasets[0].data.shift();
    }
    theTempForSearchChartRef.data.labels.push(newtheTempData.timeForSearch);
    theTempForSearchChartRef.data.datasets[0].data.push(newtheTempData.theTempForSearch);
    theTempForSearchChartRef.update();
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
