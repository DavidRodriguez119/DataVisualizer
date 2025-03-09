function GlobalCoffeeConsumptionVsProduction() {
  // Name for the visualization to appear in the menu.
  this.name = 'Global Coffee Consumption vs Production Per Capita';

  // Unique ID for the visualization.
  this.id = 'global-coffee-consumption-vs-production-per-capita';

  //Title to display
  this.title = 'Global Coffee Consumption vs Production Per Capita';

  //names for each axis
  this.xTopAxisLabel = `Consumption per Capita (kg)`;
  this.xBottomAxisLabel = `Production (tons)`;
  this.yAxisLabel = `Countries`

  //distance from the border of the canvas to the graph
  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 3,
    rightMargin: width - marginSize,
    topMargin: marginSize *2 + 5,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 12,
    numYTickLabels: 15,

    //how much distance will each data value occupy vertically
    distPerCountry: function () {
      return Math.floor((this.bottomMargin - this.topMargin) / this.numYTickLabels)
    }
  };

  // Property to represent whether data has been loaded.
  this.loadedData = false;

  //Property that stores evey value that affects the animation
  this.animation = {
    sorting: false,
    swapping: false,
    animationSpeed: 0.00000001,
    sortedBy: `production`
  }

  // Preload the data. This function is called automatically by the gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/global-coffee-consumption-vs-production-per-capita/global-coffee-consumption-vs-productio.csv', 'csv', 'header',
    // Callback function to set the value
    (table) => {
      //Map data and set initial values
      this.initializeValues();
      this.loadedData = true;
    });
  };

  //create radio buttons
  this.radioButton;

  //set the values that are going to be displayed in each axes of the graph
  this.setup = function() {
    // Font defaults.
    textSize(16);
    stroke(0);

    //create radio buttons
    //Radio #1: Sort by production
    //Radio #2: Sort by consumption
    this.radioButton = createRadio();
    this.radioButton.position(this.layout.leftMargin + 300, this.layout.topMargin - 50);
    this.radioButton.option(`Production`, `production`);
    this.radioButton.option(`Consumption`, `consumption`);
    this.radioButton.value(this.animation.sortedBy);
  };

  this.destroy = function() {
    if(this.radioButton){
      this.radioButton.style(`display`, `none`);
    };
  };

  ////////////////////////////////////////// Helper Functions ////////////////////////////////////////

  //Organized the raw data in object format (countries, production, consumption)
  this.organizeData = function (table){
    let data = [];
    //get the information one at a time and add it the organizedData array as an object
    for(let i = 0; i < table.getRowCount(); i++){
      let row = table.getRow(i);
      data.push({
        country: row.get(`Country/Territory`),
        production: parseFloat(row.get(`Production (Tons)`).replace(/,/g, ``)), //the replace was consulted using ChatGPT
        consumption: parseFloat(row.get(`Per Capita (Kg)`))
      });
    };
    return data;
  };

  //Map the data based in the graph's width
  this.mapData = function(data){
    const mappedData = [];
    for (let i = 0; i < data.length; i++) {
      mappedData.push(
        {
          country: data[i].country,
          production: this.mapValueToWidth(data[i].production, this.productionMax),
          consumption: this.mapValueToWidth(data[i].consumption, this.consumptionMax),
          currentYPos: this.initialYCoordinate[i],
        }
      )
    };

    return mappedData
  };

  // Browses an array of objects and gets the max. value of a specific key
  this.getMax = function(arrayOfObjects, keyName) {
    let maxValue = 0;
    arrayOfObjects.forEach(obj => {
      if (obj[keyName] > maxValue) {
        maxValue = obj[keyName]
      }
    });
    return Math.ceil(maxValue);
  };

  //Get the divisions of the x axes
  // Returns an array of x-values
  this.getDivisions = function(max, numDivisions){
    //max value divided in the number of desired divisions to obtain the increment value
    const increments = Math.ceil(max/numDivisions)
    const divisions = []
    for (let i = 0; i <= numDivisions; i++) {
      divisions.push(i * increments);      
    };

    return divisions
  };

  //Functions to map the values of production and consumption to the width of the graph
  this.mapValueToWidth = function (value, maxValue){
    return map(value,
                0,
                maxValue,
                this.layout.leftMargin,
                this.layout.rightMargin);
  };

  this.drawCountry = function (data, startingPosition, distPerCountry){

    //vertical distance that each bar will occupy
    const rectHeight = Math.floor(32.7 * this.layout.distPerCountry() / 100)
    const emptySpace = Math.floor(17.2 * this.layout.distPerCountry() / 100)

    //draw consumption bar
    stroke(0);
    fill(255, 0, 0);

    rect(
      this.layout.leftMargin,
      startingPosition + emptySpace,
      data.consumption - this.layout.leftMargin,
      rectHeight
    )

    //draw production bar
    stroke(0);
    fill(0, 0, 255);

    rect(
      this.layout.leftMargin,
      startingPosition + emptySpace + rectHeight,
      data.production - this.layout.leftMargin,
      rectHeight
    );

    //Draw country label
    fill(0);
    text(
      data.country,
      this.layout.leftMargin - 35,
      startingPosition + emptySpace + rectHeight
    )
  };

  //swap the value of two objects inside an array
  this.swap = function(data, index1, index2){
    //swap animation start
    this.animation.swapping = true;
    //change positions 
    if (data[index1].currentYPos > this.initialYCoordinate[index2]) {
      if (Math.abs(data[index1].currentYPos - this.initialYCoordinate[index2]) < this.layout.distPerCountry()) {
        data[index1].currentYPos = this.initialYCoordinate[index2]
      } else {
        data[index1].currentYPos -= this.animation.animationSpeed 
      };
    } else if (data[index1].currentYPos < this.initialYCoordinate[index2]){
      if (Math.abs(data[index1].currentYPos - this.initialYCoordinate[index2]) < this.layout.distPerCountry()) {
        data[index1].currentYPos = this.initialYCoordinate[index2]
      } else {
        data[index1].currentYPos = data[index1].currentYPos + this.animation.animationSpeed 
      };
    };

    if (data[index2].currentYPos > this.initialYCoordinate[index1]) {
      if (Math.abs(data[index2].currentYPos - this.initialYCoordinate[index1]) < this.layout.distPerCountry()) {
        data[index2].currentYPos = this.initialYCoordinate[index1]
      } else {
        data[index2].currentYPos -= this.animation.animationSpeed 
      };
    } else if (data[index2].currentYPos < this.initialYCoordinate[index1]){
      if (Math.abs(data[index2].currentYPos - this.initialYCoordinate[index1]) < this.layout.distPerCountry()) {
        data[index2].currentYPos = this.initialYCoordinate[index1]
      } else {
        data[index2].currentYPos = data[index2].currentYPos + this.animation.animationSpeed 
      };
    };
    
    if (data[index1].currentYPos == this.initialYCoordinate[index2] && data[index2].currentYPos == this.initialYCoordinate[index1]) {
      //change order inside mappedData
      const storedValue = data[index1];
      data[index1] = data[index2];
      data[index2] = storedValue;
      this.animation.swapping = false;
      return data
    };     

  };

  // sorting algorithm
  this.bubbleSort = function (data, criteria) {
    //read criteria
    if (criteria == `production`) {
      for (let i = 0; i < data.length; i++) {
        let count = 0;
        for (let j = 0; j < data.length - 1; j++) {
          if (data[j + 1].production < data[j].production) {
            this.swap(data, j, j+1);
            if (this.animation.swapping == true) {
              return data
            }
            count++;
          };
        };
        if (count == 0) {
          break
        };
      };
      this.animation.sortedBy = criteria
      return data;
    } else if (criteria == `consumption`) {
      for (let i = 0; i < data.length; i++) {
        let count = 0;
        for (let j = 0; j < data.length - 1; j++) {
          if (data[j + 1].consumption < data[j].consumption) {
            this.swap(data, j, j+1);
            if (this.animation.swapping == true) {
              return data
            }
            count++;
          };
        };
        if (count == 0) {
          break
        };
      };
      this.animation.sortedBy = criteria
      return data;
    };
  };

  /////////////////////////////////////// Create Important Values ///////////////////////////////////

  //Property to represent the data with the original values
  this.organizedData = [];

  //Property to represent the data with the values mapped to the width of the graph
  this.mappedData = [];

  this.consumptionMax = 0;

  this.productionMax = 0;

  //array or y-coordinates. each is a starting point for one data value
  this.initialYCoordinate = [];

  //map data and prepare all the required variables
  this.initializeValues = function () {
    //set initial yPositions
    for (let i = 0; i < this.layout.numYTickLabels; i++) {
      this.initialYCoordinate.push(this.layout.topMargin + this.layout.distPerCountry() * i)
    };  
    // Array of objects with all the imported raw data
    this.organizedData = this.organizeData(this.data);
    // Store the largest consumption value
    this.consumptionMax = this.getMax(this.organizedData, 'consumption');
    // Store the largest production value
    this.productionMax = this.getMax(this.organizedData, `production`);
    // Array of objects with all the data mapped based on the width of the graph
    this.mappedData = this.mapData(this.organizedData);
  };

  /////////////////////////////////////// Main Draw Function ////////////////////////////////////

  this.draw = function(){
    //copied the if statement from the "pay-gap-1997-2017" code
    if (!this.loadedData) {
      console.log('Data not yet loaded');
      return;
    }
    //Text for the radio buttons
    stroke(0);
    fill(0);
    text(`Sort By:`, this.layout.leftMargin + 20, this.layout.topMargin - 68)
   
    //draw chart
    this.drawTitle();
    
    this.drawXAxes();

    this.drawAxesLabels();

    this.drawYAxis();

    this.drawXAxesDivisions();

    //draw initial chart and draw chart after animation
    if (this.animation.sorting == false) {
      for (let i = 0; i < this.mappedData.length; i++) {
        this.drawCountry(this.mappedData[i], this.mappedData[i].currentYPos, this.layout.distPerCountry());
      };
    };

    //animation code
    // animation starts
    if(this.radioButton.value() != this.animation.sortedBy){
      
      console.log(`Start animation`);

      this.bubbleSort(this.mappedData, this.radioButton.value())

    };
  };

  //////////////////////////////////////// Sub - Draw Functions //////////////////////////////////////

  //Draw the title of the chart
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    textSize(18);
    textFont(`Georgia`)
    text(this.title,
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         10);
  };

  //draw the lines that will represent the two horizontal Axes
  this.drawXAxes = function(){
    stroke(0);
    // x-axis (top amd Bottom)
    line(this.layout.leftMargin,
      this.layout.bottomMargin,
      this.layout.rightMargin,
      this.layout.bottomMargin);
    line(this.layout.leftMargin,
      this.layout.topMargin,
      this.layout.rightMargin,
      this.layout.topMargin);
  };

  //decided to use my own version of the drawAxesLabels function because I need some extra functionality only for this data set
  //copied part of the drawAxisLabes function inside the helper-functions.js
  this.drawAxesLabels = function (){
    noStroke();
    textSize(12);
    textAlign('center', 'center');

    //draw bottom X Axis label
    fill(0, 0, 255);
    text(this.xBottomAxisLabel, 
      (this.layout.plotWidth()/2) + this.layout.leftMargin,
      this.layout.bottomMargin + (this.layout.marginSize * 1.3))
    
    //draw top X Axis label
    fill(255, 0, 0);
    text(this.xTopAxisLabel, 
      (this.layout.plotWidth()/2) + this.layout.leftMargin,
      this.layout.topMargin - (this.layout.marginSize ))

    //draw y axis label
    push();
      translate(this.layout.leftMargin - (this.layout.marginSize * 2.5),
        this.layout.bottomMargin / 2);
      rotate(- PI / 2);
      text(this.yAxisLabel, 0, 0);
    pop();
  };

  //Draw Y axis line
  this.drawYAxis = function (){
    stroke(0)
    line(this.layout.leftMargin,
      this.layout.topMargin,
      this.layout.leftMargin,
      this.layout.bottomMargin
    );
  };

  //Draw the increments in each horizontal axis
  this.drawXAxesDivisions = function (){
    //set the values of the top x axis
    const xTopAxisDivisions = this.getDivisions(this.consumptionMax, this.layout.numXTickLabels)

    //set the values of the bottom x axis
    const xBottomAxisDivisions = this.getDivisions(this.productionMax, this.layout.numXTickLabels);

    fill(0);
    textSize(14);

    //draw the top division lines
    for (let i = 0; i < xTopAxisDivisions.length; i++) {
      const mappedValue = map(xTopAxisDivisions[i], 0, this.consumptionMax, this.layout.leftMargin, this.layout.rightMargin);
      line(
        mappedValue,
        this.layout.topMargin - 5,
        mappedValue,
        this.layout.topMargin + 5,
      );
      text(
        xTopAxisDivisions[i],
        mappedValue,
        this.layout.topMargin - 15
      )
    };
    //Draw the bottom division lines
    for (let i = 0; i < xBottomAxisDivisions.length; i++) {
      const mappedValue = map(xBottomAxisDivisions[i], 0, this.productionMax, this.layout.leftMargin, this.layout.rightMargin);
      line(
        mappedValue,
        this.layout.bottomMargin - 5,
        mappedValue,
        this.layout.bottomMargin + 5,
      );
      const formattedValue = xBottomAxisDivisions[i].toLocaleString();
      text(
        formattedValue,
        mappedValue,
        this.layout.bottomMargin + 15
      )
    };
  };

};




