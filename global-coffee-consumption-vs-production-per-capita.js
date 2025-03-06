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
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/global-coffee-consumption-vs-production-per-capita/global-coffee-consumption-vs-productio.csv', 'csv', 'header',
    // Callback function to set the value
    function(table) {
      self.loaded = true;
    });
  };

  //set the values that are going to be displayed in each axes of the graph
  this.setup = function() {

    // Font defaults.
    textSize(16);

  };

  this.destroy = function() {

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
          consumption: this.mapValueToWidth(data[i].consumption, this.consumptionMax)
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

  /////////////////////////////////////// Create Important Values ///////////////////////////////////

  //Property to represent the data with the original values
  this.organizedData = [];
  //Property to represent the data with the values mapped to the width of the graph
  this.mappedData = [];

  this.consumptionMax = 0;

  this.productionMax = 0;

  /////////////////////////////////////// Main Draw Function ////////////////////////////////////

  this.draw = function(){
    //copied the if statement from the "pay-gap-1997-2017" code
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Array of objects with all the imported raw data
    this.organizedData = this.organizeData(this.data);
    // Array of objects with all the data mapped based on the width of the graph
    this.mappedData = this.mapData(this.organizedData);
    // Store the largest consumption value
    this.consumptionMax = this.getMax(this.organizedData, 'consumption');
    // Store the largest production value
    this.productionMax = this.getMax(this.organizedData, `production`);

    //draw chart
    this.drawTitle();
    
    this.drawXAxes();

    this.drawAxesLabels();

    this.drawYAxis();

    this.drawXAxesDivisions();

    this.drawChart();
  };

  //////////////////////////////////////// Sub - Draw Functions //////////////////////////////////////

  //Draw the title of the chart
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    textSize(24);
    textFont(`Georgia`)
    text(this.title,
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         this.layout.topMargin - (this.layout.marginSize + 20));
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
    fill(0);
    noStroke();
    textSize(12);
    textAlign('center', 'center');

    //draw bottom X Axis label
    text(this.xBottomAxisLabel, 
      (this.layout.plotWidth()/2) + this.layout.leftMargin,
      this.layout.bottomMargin + (this.layout.marginSize * 1.8))
    
    //draw top X Axis label
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

  this.drawXAxesDivisions = function (){
    //set the values of the top x axis
    const xTopAxisDivisions = this.getDivisions(this.consumptionMax, this.layout.numXTickLabels)

    //set the values of the bottom x axis
    const xBottomAxisDivisions = this.getDivisions(this.productionMax, this.layout.numXTickLabels);

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

  this.drawChart = function () {
    //how much distance will each data value occupy vertically
    const distPerCountry = Math.floor((this.layout.bottomMargin - this.layout.topMargin) / this.layout.numYTickLabels)
    
    //vertical distance that each bar will occupy
    const rectHeight = Math.floor(32.7 * distPerCountry / 100)

    //array or y-coordinates. each is a starting point for one data value
    const initialYCoordinate = [];
    for (let i = 0; i < this.layout.numYTickLabels; i++) {
      initialYCoordinate.push(this.layout.topMargin + distPerCountry * i)
      stroke(255, 0, 0)
      line(this.layout.leftMargin + 5*i,
            initialYCoordinate[i],
            this.layout.leftMargin + 5 * i,
            distPerCountry + initialYCoordinate[i]
      )
    };                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    
    //Continue.........................

  };
};

