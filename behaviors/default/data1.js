import { PawnBehavior } from "../PrototypeBehavior";
import * as THREE from "three";

class LightPawn extends PawnBehavior {
  setup() {
    let trm = this.service("ThreeRenderManager");
    let group = this.shape;
    let THREE = Microverse.THREE;
    let model;
    const originalMaterials = new Map(); // Store original materials for each object
    let highlightedObject = null; // Define highlightedObject variable

    const allowedObjects = new Set();

    const onDocumentMouseClick = async (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, trm.camera);

      const intersects = raycaster.intersectObjects(
        Array.from(allowedObjects),
        true
      );

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const apiValue = await toggleAPI();

        if (apiValue === 1) {
          await storeClickedObjectName(clickedObject.name);
        } else {
          resetHighlightAndHideInfo();
          await storeClickedObjectName("NULL");
          return; // Exit early since we're resetting on API value `0`
        }

        const storeData = await fetchStoredObjectName();

        if (highlightedObject === clickedObject) {
          resetHighlightAndHideInfo();
        } else {
          if (highlightedObject) {
            resetObjectMaterial(highlightedObject);
          }
          highlightObject(storeData);
          speakObjectName(storeData);
        }
      } else {
        resetHighlightAndHideInfo(); // If clicked outside, reset highlight
      }
    };

    // const highlightObject = (object) => {
    //   // Ensure the object has a material
    //   if (object && object.material) {
    //     // Apply highlight only if the object has a material
    //     if (!originalMaterials.has(object)) {
    //       originalMaterials.set(object, object.material.clone());
    //     }
    //     const highlightMaterial = new THREE.MeshBasicMaterial({
    //       color: 0xffff00,
    //     });
    //     object.material = highlightMaterial;
    //     highlightedObject = object;
    //   } else {
    //     console.warn("Object has no material or is undefined:", object);
    //   }
    // };

    function highlightObject(object) {
      if (!object) {
        console.warn("Object is undefined. Cannot highlight.");
        return; // Exit the function if object is undefined
      }

      // Check if the object is valid and is not a string or some unexpected type
      if (typeof object !== "object" || object === null || !object.isMesh) {
        console.warn(
          `Invalid object type: ${typeof object}. Expected a 3D object.`
        );
        return;
      }

      // If the object does not have a material, assign a default material
      if (!object.material) {
        console.warn(
          `Object ${object.name} has no material. Assigning default material.`
        );
        object.material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Default material
      }

      // If the object is already highlighted, skip
      if (!originalMaterials.has(object)) {
        originalMaterials.set(object, object.material.clone());
      }

      // Apply highlight
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
      });
      object.material = highlightMaterial;
      highlightedObject = object;
    }

    const resetObjectMaterial = (object) => {
      // Check if the object has an original material stored
      const originalMaterial = originalMaterials.get(object);
      if (originalMaterial) {
        object.material = originalMaterial; // Reset to original material
      } else {
        console.warn("Object has no original material:", object);
      }

      // Clear the highlightedObject if it is being reset
      if (highlightedObject === object) {
        highlightedObject = null;
      }
    };

    const resetHighlightAndHideInfo = () => {
      if (highlightedObject) {
        resetObjectMaterial(highlightedObject); // Reset object material
        hideAllInfo(); // Hide any displayed info
        highlightedObject = null;
      }
    };

    const checkAPIResponse = async () => {
      try {
        const response = await fetch("https://btnstate.onrender.com/btn-state");
        const result = await response.json();
        return result; // Assuming the response has a 'value' field
      } catch (error) {
        console.error("Error checking API response:", error);
        return 0; // Return 0 if there is an error
      }
    };

    setInterval(async () => {
      const apiValue = await checkAPIResponse();
      if (apiValue === 0) {
        resetHighlightAndHideInfo();
      } else if (highlightedObject) {
        handleObjectInteraction(highlightedObject);
      }
    }, 3000);

    // Fetch and highlight the object from API periodically
    const fetchHighlightedObjectName = async () => {
      try {
        const response = await fetch(
          "https://termpvariable.vercel.app/get-data"
        );
        const result = await response.json();
        highlightObjectByName(result.data);
        console.log(result.data, "fgdtyf");
      } catch (error) {
        console.error("Error fetching highlighted object name:", error);
      }
    };

    const highlightObjectByName = (name) => {
      const objectToHighlight = Array.from(allowedObjects).find(
        (obj) => obj.name === name
      );
      if (objectToHighlight) {
        highlightObject(objectToHighlight);
        highlightedObject = objectToHighlight;
      }
    };

    setInterval(fetchHighlightedObjectName, 3000);

    const speakObjectName = (name) => {
      const utterance = new SpeechSynthesisUtterance(name);
      speechSynthesis.speak(utterance);
    };
    const stopSpeaking = () => {
      speechSynthesis.cancel();
    };

    const displayHVACInfo = (object) => {
      const HVACInfo = document.getElementById("HVACInfo");
      const powerCoolingTower = generateDynamicPower();

      HVACInfo.innerHTML = `
                <h3>HVAC Rack Info</h3>
                <p>Name: ${object.name || "N/A"}</p>
                <p>Power Cooling Tower: ${powerCoolingTower} kW</p>
                <hr>
            `;

      HVACInfo.style.left = "10px"; // Set position to fixed values for now
      HVACInfo.style.top = "10px";
      HVACInfo.style.display = "block";

      // Update and display the perforation chart
    };

    const generateDynamicPower = () => {
      return 5 + Math.floor(Math.random() * 6); // Generate power between 5 and 10 kW
    };
    const hideHVACInfo = () => {
      const HVACInfo = document.getElementById("HVACInfo");
      HVACInfo.style.display = "none";
    };

    const displayServerInfo = (server) => {
      const serverInfo = document.getElementById("serverInfo");
      serverInfo.innerHTML = `
                <h3>${server.name || "N/A"} Info</h3>
                <p>Name: ${server.name || "N/A"}</p>
                ${getSubChildrenInfo(server)}
                <hr>
            `;
      serverInfo.style.left = "10px"; // Set position to fixed values for now
      serverInfo.style.top = "10px";
      serverInfo.style.display = "block";
    };

    const getSubChildrenInfo = (object) => {
      let info = "";
      object.children.forEach((child, index) => {
        info += `<p>Sub-child Name: ${child.name || "N/A"}</p>`;
      });
      return info;
    };

    const hideServerInfo = () => {
      const serverInfo = document.getElementById("serverInfo");
      serverInfo.style.display = "none";
    };

    const displayTileInfo = (object) => {
      const tileInfo = document.getElementById("TileInfo");
      const dynamicTemperature = generateDynamicTemperature();
      const perforationPercentage = generatePerfuration();

      tileInfo.innerHTML = `
                <h3>Perforated Tile Info</h3>
                <p>Name: ${object.name || "N/A"}</p>
                <p>Temperature: ${dynamicTemperature} °C</p>
                <p>Perforation: ${perforationPercentage} %</p>
                <div id="perfurationChartContainer" style=" position: absolute;
             
               
                padding: 3px;
                border: 0.2px solid #ccc;
                z-index: 1000;
                top: 150px !important;
                left: 5px;
                bottom: 100px;
                height: 170px !important;
                width: 180px !important;"></div>
                <hr>
            `;
      tileInfo.style.left = "10px"; // Set position to fixed values for now
      tileInfo.style.top = "10px";
      tileInfo.style.display = "block";

      // Update and display the perforation chart
      const perforationData = {
        percentage: perforationPercentage,
      };
      updatePerfurationChart(perforationData);
    };

    const hideTileInfo = () => {
      const tileInfo = document.getElementById("TileInfo");
      tileInfo.style.display = "none";
    };

    const hideCharts = () => {
      const chartContainer = document.getElementById("chartContainer");
      // const powerProfileContainer = document.getElementById('powerProfileContainer');

      if (chartContainer) {
        chartContainer.style.display = "none";
      }

      // if (powerProfileContainer) {
      //     powerProfileContainer.style.display = 'none';
      // }
    };
    const hideCharts1 = () => {
      const chartContainer1 = document.getElementById("chartContainer1");

      if (chartContainer1) {
        chartContainer1.style.display = "none";
      }
    };
    const hideCharts2 = () => {
      const powerProfileContainer = document.getElementById(
        "powerProfileContainer"
      );

      if (powerProfileContainer) {
        powerProfileContainer.style.display = "none";
      }
    };
    const hideCharts3 = () => {
      const powerProfileContainer1 = document.getElementById(
        "powerProfileContainer1"
      );

      if (powerProfileContainer1) {
        powerProfileContainer1.style.display = "none";
      }
    };
    const hideCharts4 = () => {
      const chartContainerA = document.getElementById("chartContainerA");

      if (chartContainerA) {
        chartContainerA.style.display = "none";
      }
      const chartContainerB = document.getElementById("chartContainerB");

      if (chartContainerB) {
        chartContainerB.style.display = "none";
      }
      const container_humidity = document.getElementById("container_humidity");

      if (container_humidity) {
        container_humidity.style.display = "none";
      }
    };

    const hideAllInfo = () => {
      hideServerInfo();
      hideCharts();
      hideCharts1();
      hideCharts2();
      hideCharts3();
      hideTileInfo();
      hideCharts4();
      hideHVACInfo();
    };

    const updateCharts = (object) => {
      // updateHighchartsChart(object);
      updateHighchartsChart1(object);
      updatePowerProfileChart1(object);
    };
    const updateCharts1 = (object) => {
      updateHighchartsChart(object);
      // updateHighchartsChart1(object);
      updatePowerProfileChart(object);
    };
    const updateCharts2 = (object) => {
      // updateHighchartsChart(object);
      updateAirGuageChart1(object);
      updateTempChart1(object);
      updateHumidityChart(object);
    };

    let tempChart;
    let humidityChart;

    const updateAirGuageChart1 = (object) => {
      const chartContainerA = document.getElementById("chartContainerA");

      if (!(chartContainerA instanceof HTMLDivElement)) {
        return;
      }

      const dynamicData = generateDynamicDataA(object);

      Highcharts.chart("chartContainerA", {
        chart: {
          type: "gauge",
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false,
          height: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        },
        title: {
          text: "Air Flow Rate",
          style: {
            color: "black",
            fontWeight: "bold",
          },
        },
        pane: {
          startAngle: -90,
          endAngle: 90,
          background: null,
          center: ["50%", "75%"],
          size: "110%",
        },
        yAxis: {
          min: 0,
          max: 500,
          tickPixelInterval: 72,
          tickPosition: "inside",
          tickColor:
            Highcharts.defaultOptions.chart.backgroundColor || "#FFFFFF",
          tickLength: 20,
          tickWidth: 2,
          minorTickInterval: null,
          labels: {
            distance: 20,
            style: {
              fontSize: "14px",
            },
          },
          lineWidth: 0,
          plotBands: [
            {
              from: 0,
              to: 250,
              color: "#55BF3B",
              thickness: 20,
              borderRadius: "50%",
            },
            {
              from: 250,
              to: 400,
              color: "#DDDF0D",
              thickness: 20,
              borderRadius: "50%",
            },
            {
              from: 400,
              to: 500,
              color: "#DF5353",
              thickness: 20,
            },
          ],
        },
        series: [
          {
            name: "Flow",
            data: dynamicData.series[0].data,
            tooltip: {
              valueSuffix: " cfm",
            },
            dataLabels: {
              format: "{y} cfm",
              borderWidth: 0,
              color:
                (Highcharts.defaultOptions.title &&
                  Highcharts.defaultOptions.title.style &&
                  Highcharts.defaultOptions.title.style.color) ||
                "#333333",
              style: {
                fontSize: "16px",
              },
            },
            dial: {
              radius: "80%",
              backgroundColor: "gray",
              baseWidth: 12,
              baseLength: "0%",
              rearLength: "0%",
            },
            pivot: {
              backgroundColor: "gray",
              radius: 6,
            },
          },
        ],
      });

      chartContainerA.style.display = "block";
    };

    const generateDynamicDataA = (object) => {
      const categories = ["00:00"];
      const seriesData = categories.map((category, index) => {
        const baseTime = Date.now();
        const timestamp = baseTime + index * 3600 * 1000 * 4;
        const flow = 300 + Math.floor(Math.random() * 100);
        return [timestamp, flow];
      });

      return {
        categories,
        series: [
          {
            name: object.name || "Object",
            data: seriesData,
          },
        ],
      };
    };

    // Add some life
    setInterval(() => {
      if (tempChart) {
        const point = tempChart.series[0].points[0],
          inc = Math.round((Math.random() - 0.5) * 20);

        let newVal = point.y + inc;
        if (newVal < 300 || newVal > 400) {
          newVal = point.y - inc;
        }

        point.update(newVal);
      }
    }, 3000);

    const updateTempChart1 = (object) => {
      const chartContainerB = document.getElementById("chartContainerB");

      if (!(chartContainerB instanceof HTMLDivElement)) {
        return;
      }

      const dynamicData = generateDynamicDataB(object);

      const gaugeOptions = {
        chart: {
          type: "solidgauge",
          height: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        },
        title: {
          text: "Set Point Temperature",
          style: {
            color: "black",
            fontWeight: "bold",
          },
        },
        pane: {
          center: ["50%", "75%"],
          size: "110%",
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: null,
            innerRadius: "60%",
            outerRadius: "100%",
            shape: "arc",
          },
        },
        tooltip: {
          enabled: false,
        },
        yAxis: {
          min: 0,
          max: 35,
          lineWidth: 0,
          tickWidth: 0,
          minorTickInterval: null,
          tickAmount: 5,
          title: {
            y: -70,
          },
          labels: {
            y: 16,
            style: {
              fontSize: "14px",
            },
          },
        },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true,
              style: {
                color: "black",
                fontWeight: "bold",
              },
            },
          },
        },
        series: [
          {
            name: "Temp",
            data: [dynamicData.series[0].data[0][1]],
            dataLabels: {
              format:
                '<div style="text-align:center">' +
                '<span style="font-size:25px; color: black; font-weight: bold">{y}</span><br/>' +
                '<span style="font-size:12px;opacity:0.4">°C</span>' +
                "</div>",
            },
            tooltip: {
              valueSuffix: "°C",
            },
          },
        ],
      };

      tempChart = Highcharts.chart(
        "chartContainerB",
        Highcharts.merge(gaugeOptions)
      );

      chartContainerB.style.display = "block";

      const updateChart = () => {
        if (tempChart && !tempChart.renderer.forExport) {
          const point = tempChart.series[0].points[0];
          const newTemp = dynamicData.series[0].data[0][1];
          point.update(newTemp);
        }
      };

      setInterval(updateChart, 3000);
    };

    const generateDynamicDataB = (object) => {
      const categories = ["00:00"];
      const seriesData = categories.map(() => {
        const baseTime = Date.now();
        const temp = Math.floor(Math.random() * 35);
        return [baseTime, temp];
      });

      return {
        categories,
        series: [
          {
            name: object.name || "Object",
            data: seriesData,
          },
        ],
      };
    };

    const updateHumidityChart = (object) => {
      const chartContainerHumidity =
        document.getElementById("container_humidity");

      if (!(chartContainerHumidity instanceof HTMLDivElement)) {
        return;
      }

      const dynamicDataHumidity = generateDynamicDataHumidity(object);

      const gaugeOptionsHumidity = {
        chart: {
          type: "solidgauge",
          height: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        },
        title: {
          text: "Humidity",
          style: {
            color: "black",
            fontWeight: "bold",
          },
        },
        pane: {
          center: ["50%", "75%"],
          size: "110%",
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: null,
            innerRadius: "60%",
            outerRadius: "100%",
            shape: "arc",
          },
        },
        tooltip: {
          enabled: false,
        },
        yAxis: {
          min: 20,
          max: 80,
          lineWidth: 0,
          tickWidth: 0,
          minorTickInterval: null,
          tickAmount: 5,
          title: {
            y: -70,
          },
          labels: {
            y: 16,
            style: {
              fontSize: "14px",
            },
          },
        },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true,
              style: {
                color: "black",
                fontWeight: "bold",
              },
            },
          },
        },
        series: [
          {
            name: "Humidity",
            data: [dynamicDataHumidity.series[0].data[0][1]],
            dataLabels: {
              format:
                '<div style="text-align:center">' +
                '<span style="font-size:25px; color: black; font-weight: bold">{y}</span><br/>' +
                '<span style="font-size:12px;opacity:0.4"></span>' +
                "</div>",
            },
            tooltip: {
              valueSuffix: "°C",
            },
          },
        ],
      };

      humidityChart = Highcharts.chart(
        "container_humidity",
        Highcharts.merge(gaugeOptionsHumidity)
      );

      chartContainerHumidity.style.display = "block";

      const updateChart = () => {
        if (humidityChart && !humidityChart.renderer.forExport) {
          const point = humidityChart.series[0].points[0];
          const newHumidity = dynamicDataHumidity.series[0].data[0][1];
          point.update(newHumidity);
        }
      };

      setInterval(updateChart, 3000);
    };

    const generateDynamicDataHumidity = (object) => {
      const categories = ["00:00"];
      const seriesData = categories.map(() => {
        const baseTime = Date.now();
        const humidity = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
        return [baseTime, humidity];
      });

      return {
        categories,
        series: [
          {
            name: object.name || "Object",
            data: seriesData,
          },
        ],
      };
    };

    const updateHighchartsChart = (object) => {
      const chartContainer = document.getElementById("chartContainer");

      // Ensure chartContainer is a div element
      if (!(chartContainer instanceof HTMLDivElement)) {
        return;
      }

      // Example dynamic data generation
      const dynamicData = generateDynamicData(object);

      Highcharts.chart("chartContainer", {
        chart: {
          type: "line",
          zooming: {
            type: "x",
          },
          backgroundColor: "rgba(255, 255, 255, 0.4)", // Transparent blue background
        },
        title: {
          text: "Server Temperature Profile",
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        xAxis: {
          categories: dynamicData.categories, // Add categories to the x-axis
          title: {
            text: `${object.name || "N/A"}`, // Correctly reference object.name
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
              rotate: 45, // Rotation angle
            },
          },
          type: "datetime",
          tickPositions: dynamicData.categories.map(
            (_, index) => Date.now() + index * 3600 * 1000 * 4
          ),
          labels: {
            style: {
              color: "black", // Font color for x-axis values
              fontWeight: "bold", // Font weight
              fontSize: "14px", // Decrease font size
            },
            formatter: function () {
              return Highcharts.dateFormat("%H:%M", this.value); // Format to show hours and minutes
            },
            rotation: -45, // Rotate labels
          },
        },
        yAxis: {
          title: {
            text: "Temperature(°C)",
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for y-axis values
              fontWeight: "bold", // Font weight
            },
          },
          min: 0, // Adjusted minimum y-axis value to show full range
          max: 100, // Adjusted maximum y-axis value to show full range
          tickInterval: 10, // Set interval of y-axis
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: "°C",
          xDateFormat: "%A, %b %e %H:%M",
        },
        legend: {
          enabled: true,
        },
        series: [
          {
            name: "CPU Temperature",
            data: dynamicData.cpuData,
            color: "#EE2E3A",
            style: {
              color: "black", // Font color for y-axis values
              fontWeight: "bold", // Font weight
            }, // Corrected color code
          },
          {
            name: "GPU Temperature",
            data: dynamicData.gpuData,
            color: "#80f2ff",
            style: {
              color: "black", // Font color for y-axis values
              fontWeight: "bold", // Font weight
            },
            // Corrected color code
          },
          {
            name: "RAM Temperature",
            data: dynamicData.ramData,
            color: "#ffde2d",
            style: {
              color: "black", // Font color for y-axis values
              fontWeight: "bold", // Font weight
            }, // Corrected color code
          },
        ],
      });

      // Display the chart
      chartContainer.style.display = "block";
    };

    const generateDynamicData = (object) => {
      const categories = [
        "00:00",
        "02:00",
        "04:00",
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
        "22:00",
      ];
      const baseTime = Date.now(); // Use current time as a base

      // Generate random temperature data for each category
      const cpuData = categories.map((category, index) => {
        const timestamp = baseTime + index * 3600 * 1000 * 4; // Increment by four hours
        const temperature = 40 + Math.floor(Math.random() * 46); // Generate temperature between 40 and 85
        return [timestamp, temperature];
      });

      const gpuData = categories.map((category, index) => {
        const timestamp = baseTime + index * 3600 * 1000 * 4; // Increment by four hours
        const temperature = 55 + Math.floor(Math.random() * 46); // Generate temperature between 55 and 100
        return [timestamp, temperature];
      });

      const ramData = categories.map((category, index) => {
        const timestamp = baseTime + index * 3600 * 1000 * 4; // Increment by four hours
        const temperature = 30 + Math.floor(Math.random() * 31); // Generate temperature between 30 and 60
        return [timestamp, temperature];
      });

      return {
        categories,
        cpuData,
        gpuData,
        ramData,
      };
    };

    const updateHighchartsChart1 = (object) => {
      const chartContainer1 = document.getElementById("chartContainer1");

      // Ensure chartContainer is a div element
      if (!(chartContainer1 instanceof HTMLDivElement)) {
        return;
      }

      // Example dynamic data generation
      const dynamicData = generateDynamicData1(object);

      Highcharts.chart("chartContainer1", {
        chart: {
          type: "arearange",
          zooming: {
            type: "x",
          },
          backgroundColor: "rgba(255, 255, 255, 0.4)", // Transparent blue background
        },
        title: {
          text: "Rack Temperature Profile",
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        xAxis: {
          title: {
            text: `${object.name || "N/A"}`, // Correctly reference object.name
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          type: "datetime",
          tickPositions: dynamicData.categories.map(
            (_, index) => Date.now() + index * 3600 * 1000 * 4
          ),
          labels: {
            style: {
              color: "black", // Font color for x-axis values
              fontWeight: "bold", // Font weight
            },
            formatter: function () {
              return Highcharts.dateFormat("%H:%M", this.value); // Format to show hours and minutes
            },
          },
        },
        yAxis: {
          title: {
            text: "Temperature(°C)",
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for y-axis values
              fontWeight: "bold", // Font weight
            },
          },
          min: 50, // Set minimum y-axis value
          max: 300, // Set maximum y-axis value
          tickInterval: 50, // Set interval of y-axis
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: "°C",
          xDateFormat: "%A, %b %e %H:%M",
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            name: "Temperatures",
            data: dynamicData.series[0].data, // Assuming the dynamic data series structure matches
            color: {
              linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1,
              },
              stops: [
                [0, "#ff0000"],
                [1, "#0000ff"],
              ],
            },
          },
        ],
      });

      // Display the chart
      chartContainer1.style.display = "block";
    };

    const generateDynamicData1 = (object) => {
      const categories = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

      // Generate random temperature range data for each category
      const seriesData = categories.map((category, index) => {
        const baseTime = Date.now(); // Use current time as a base
        const timestamp = baseTime + index * 3600 * 1000 * 4; // Increment by four hours
        const minTemp = 50 + Math.floor(Math.random() * 50); // Generate min temperature between 50 and 100
        const maxTemp = minTemp + Math.floor(Math.random() * 200); // Generate max temperature up to 300
        return [timestamp, minTemp, maxTemp];
      });

      return {
        categories,
        series: [
          {
            name: object.name || "Object",
            data: seriesData,
          },
        ],
      };
    };
    const updatePowerProfileChart = (object) => {
      const powerProfileContainer = document.getElementById(
        "powerProfileContainer"
      );

      // Ensure powerProfileContainer is a div element
      if (!(powerProfileContainer instanceof HTMLDivElement)) {
        return;
      }

      // Generate dynamic data for power profile
      const powerProfileData = generatePowerProfileData(object);

      Highcharts.chart("powerProfileContainer", {
        chart: {
          zoomType: "x",
          backgroundColor: "rgba(255, 255, 255, 0.4)", // Transparent blue background
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        title: {
          text: "Server Power Profile",
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        xAxis: {
          categories: powerProfileData.categories,
          title: {
            text: `${object.name || "N/A"}`, // Correctly reference object.name
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for x-axis values
              fontSize: "10px", // Decrease font size
            },
            rotation: -45, // Rotate labels
          },
        },
        yAxis: {
          title: {
            text: "Power Consumption (W)",
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for y-axis values
            },
          },
          min: 400, // Set minimum y-axis value
          max: 1400, // Set maximum y-axis value
          tickInterval: 200, // Set y-axis interval to 200
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
              },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [
                  1,
                  Highcharts.color(Highcharts.getOptions().colors[0])
                    .setOpacity(0)
                    .get("rgba"),
                ],
              ],
            },
            marker: {
              radius: 2,
              enabled: true, // Enable markers
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            threshold: null,
          },
        },
        series: [
          {
            type: "area",
            name: "Watts",
            data: powerProfileData.data,
            marker: {
              enabled: true, // Enable markers
              radius: 4, // Set marker radius
            },
            dataLabels: {
              enabled: true, // Enable data labels
              format: "{y} W", // Format for data labels
              style: {
                fontSize: "10px", // Set font size for data labels
              },
            },
          },
        ],
      });

      // Display the chart
      powerProfileContainer.style.display = "block";
    };

    const generatePowerProfileData = (object) => {
      // Example dynamic data generation for power profile
      const categories = [
        "00:00",
        "02:00",
        "04:00",
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
        "22:00",
      ];

      // Example: generating random data for power profile within 400W to 1400W
      const data = Array.from(
        { length: categories.length },
        () => 400 + Math.floor(Math.random() * 1000)
      );

      // Mark 10 points with markers
      const markedData = data.map((value, index) => {
        return {
          y: value,
          marker: {
            enabled: index < 10, // Enable marker for the first 10 points
          },
        };
      });

      return { categories, data: markedData };
    };
    const updatePowerProfileChart1 = (object) => {
      const powerProfileContainer1 = document.getElementById(
        "powerProfileContainer1"
      );

      // Ensure powerProfileContainer is a div element
      if (!(powerProfileContainer1 instanceof HTMLDivElement)) {
        return;
      }

      // Generate dynamic data for power profile
      const powerProfileData = generatePowerProfileData1(object);

      Highcharts.chart("powerProfileContainer1", {
        chart: {
          zoomType: "x",
          backgroundColor: "rgba(255, 255, 255, 0.4)", // Transparent blue background
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        title: {
          text: "Rack Power Profile",
          style: {
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        xAxis: {
          categories: powerProfileData.categories,
          title: {
            text: `${object.name || "N/A"}`, // Correctly reference object.name
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for x-axis values
              fontSize: "10px", // Decrease font size
            },
            rotation: -45, // Rotate labels
          },
        },
        yAxis: {
          title: {
            text: "Power Consumption (kW)",
            style: {
              color: "black", // Font color
              fontWeight: "bold", // Font weight
            },
          },
          labels: {
            style: {
              color: "black", // Font color for y-axis values
            },
            formatter: function () {
              return this.value / 1000 + "kW"; // Format labels as kW
            },
          },
          min: 1000, // Set minimum y-axis value to 1kW (1000W)
          max: 10000, // Set maximum y-axis value to 10kW (10000W)
          tickInterval: 1000, // Set y-axis interval to 1kW (1000W)
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
              },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [
                  1,
                  Highcharts.color(Highcharts.getOptions().colors[0])
                    .setOpacity(0)
                    .get("rgba"),
                ],
              ],
            },
            marker: {
              radius: 2,
              enabled: true, // Enable markers
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            threshold: null,
          },
        },
        series: [
          {
            type: "area",
            name: "Watts",
            data: powerProfileData.data,
            marker: {
              enabled: true, // Enable markers
              radius: 4, // Set marker radius
            },
            dataLabels: {
              enabled: true, // Enable data labels
              format: "{y} W", // Format for data labels
              style: {
                fontSize: "10px", // Set font size for data labels
              },
              formatter: function () {
                return this.y / 1000 + "kW"; // Format data labels as kW
              },
            },
          },
        ],
      });

      // Display the chart
      powerProfileContainer1.style.display = "block";
    };

    const generatePowerProfileData1 = (object) => {
      // Set specific time categories for the x-axis
      const categories = [
        "00:00",
        "02:00",
        "04:00",
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
        "22:00",
      ];

      // Example: generating random data for power profile within 1kW to 10kW
      const data = Array.from(
        { length: categories.length },
        () => 1000 + Math.floor(Math.random() * 9000)
      );

      // Mark 10 points with markers
      const markedData = data.map((value, index) => {
        return {
          y: value,
          marker: {
            enabled: index < 10, // Enable marker for the first 10 points
          },
        };
      });

      return { categories, data: markedData };
    };

    const generateDynamicTemperature = () => {
      return 5 + Math.floor(Math.random() * 11);
    };

    const updatePerfurationChart = (perforationData) => {
      Highcharts.chart("perfurationChartContainer", {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: 0,
          plotShadow: false,
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Transparent white background
        },
        title: {
          text: `Tile<br>Perforation<br>${perforationData.percentage}%`,
          align: "center",
          verticalAlign: "middle",
          y: 70,
          style: {
            fontSize: "1.1em",
            color: "black", // Font color
            fontWeight: "bold", // Font weight
          },
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: true,
              distance: -50,
              style: {
                fontWeight: "bold",
                color: "white",
              },
            },
            startAngle: -90,
            endAngle: 90,
            center: ["50%", "75%"],
            size: "100%",
          },
        },
        series: [
          {
            type: "pie",
            name: "Perforation",
            innerSize: "50%",
            data: [
              {
                name: "Perforation",
                y: perforationData.percentage,
                color: "blue",
              },
              {
                name: "",
                y: 100 - perforationData.percentage,
                color: "lightblue",
              },
            ],
          },
        ],
      });
    };

    const generatePerfuration = () => {
      const minPercentage = 30; // 30%
      const maxPercentage = 75; // 75%
      const range = maxPercentage - minPercentage;
      const percentage = minPercentage + Math.random() * range;
      return Math.round(percentage);
    };

    const toggleAPI = async () => {
      try {
        const response = await fetch(
          "https://btnstate.onrender.com/toggle-btn",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        console.log(`API Response: ${result}`);
        return result; // Assuming the API returns the new state value
      } catch (error) {
        console.error("Error toggling API:", error);
        return 0; // Return 0 in case of an error
      }
    };
    const fetchStoredObjectName = async () => {
      try {
        const response = await fetch(
          "https://termpvariable.vercel.app/get-data"
        );
        const result = await response.json();

        const storedObjectName = result.data; // Assuming 'data' contains the object name
        console.log("Fetched object name from API:", storedObjectName);
        return storedObjectName;
      } catch (error) {
        console.error("Error fetching object name from API:", error);
        return null;
      }
    };
    const handleObjectInteraction = async (clickedObject) => {
      const apiValue = await checkAPIResponse(); // Check the API response

      if (apiValue === 1) {
        let isTile = false;
        let isRack = false;
        let isObject = false;

        // Check if clickedObject is a tile
        for (let i = 0; i <= 77; i++) {
          if (clickedObject === model.children[71].children[i]) {
            isTile = true;
            break;
          }
        }

        if (isTile) {
          hideServerInfo();
          hideCharts();
          hideCharts2();
          hideCharts1();
          hideCharts3();
          hideHVACInfo();
          hideCharts4();
          displayTileInfo(clickedObject);
        } else {
          // Check if clickedObject is a rack
          for (let i = 0; i <= 70; i++) {
            if (clickedObject === model.children[i].children[0]) {
              if (i >= 5 && i <= 15) {
                continue; // Skip certain racks
              }
              isRack = true;
              break;
            }
          }

          if (isRack) {
            displayServerInfo(clickedObject);
            updateCharts(clickedObject);
            hideTileInfo();
            hideHVACInfo();
            hideCharts();
            hideCharts2();
            hideCharts4();
          } else {
            // Check if clickedObject is another specific object type
            for (let i = 0; i <= 17; i++) {
              for (let j = 0; j <= 2; j++) {
                if (
                  clickedObject === model.children[79].children[i].children[j]
                ) {
                  isObject = true;
                  break;
                }
              }
            }

            if (isObject) {
              displayHVACInfo(clickedObject);
              updateCharts2(clickedObject);
              hideServerInfo();
              hideCharts3();
              hideCharts1();
              hideTileInfo();
              hideCharts();
              hideCharts2();
            } else {
              displayServerInfo(clickedObject);
              hideHVACInfo();
              updateCharts1(clickedObject);
              hideTileInfo();
              hideCharts1();
              hideCharts3();
              hideCharts4();
              hideHVACInfo();
            }
          }
        }
      } else {
        // Hide the serverInfo div and charts if no object is clicked
        hideAllInfo();

        // Reset previously highlighted object
        if (highlightedObject) {
          resetObjectMaterial(highlightedObject);
          stopSpeaking();
          highlightedObject = null; // Clear the highlightedObject
        }
      }
    };

    const storeClickedObjectName = async (name) => {
      try {
        const response = await fetch(
          "https://termpvariable.vercel.app/store-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ variable: name }),
          }
        );

        const result = await response.json();
        console.log("Stored object name in API:", result);
      } catch (error) {
        console.error("Error storing clicked object name in API:", error);
      }
    };

    // Handle mouse click
    document.addEventListener("click", onDocumentMouseClick, false);

    // GLTF loader setup
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/libs/draco/"
    );
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    this.lights = [];
    const loadModelPromise = new Promise((resolve, reject) => {
      gltfLoader.load(
        "./assets/Change New.glb",
        (gltf) => {
          model = gltf.scene;
          model.position.set(0, -1.6, 0);
          const scaleFactor = 2;
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          group.add(model);
          console.log(model);

          model.children.forEach((child, index) => {
            if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
              child.children.forEach((subchild, subIndex) => {
                if (subIndex >= 1 && subIndex <= 12) {
                  allowedObjects.add(subchild);
                }
              });
            }
          });
          model.children.forEach((child, index) => {
            if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
              child.children.forEach((subchild, subIndex) => {
                if (subIndex === 0) {
                  allowedObjects.add(subchild);
                }
              });
            }
          });
          model.children.forEach((child, index) => {
            if (index === 71 || index === 79) {
              allowedObjects.add(child); // Ensure all relevant children are included
            }
          });

          resolve(model);
        },
        null,
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });

    loadModelPromise.catch((error) => {
      console.error("Error loading GLTF model:", error);
    });
  }

  teardown() {
    let scene = this.service("ThreeRenderManager").scene;

    scene.background?.dispose();
    scene.environment?.dispose();
    scene.background = null;
    scene.environment = null;

    // Dispose particle system
    if (this.particleSystem) {
      this.shape.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
    }
  }
}

export default {
  modules: [
    {
      name: "Data1",
      pawnBehaviors: [LightPawn],
    },
  ],
};
