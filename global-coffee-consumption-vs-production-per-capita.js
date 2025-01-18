function GlobalCoffeeConsumptionVsProduction() {
  // Name for the visualization to appear in the menu.
  this.name = 'Global Coffee Consumption vs Production Per Capita';

  // Unique ID for the visualization.
  this.id = 'global-coffee-consumption-vs-production-per-capita';

  //Title to display
  this.title = 'Global Coffee Consumption vs Production Per Capita';

  //names for each axis
  this.xTopAxisLabel = `Production (tons)`;
  this.xBottomAxisLabel = `Consumption per Capita (kg)`;
  this.yAxisLabel = `Countries`

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize * 2,
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
    numYTickLabels: 25,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  //Property to represent the data
  this.organizedData = [];

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/global-coffee-consumption-vs-production-per-capita/global-coffee-consumption-vs-productio.csv', 'csv', 'header',
    // Callback function to set the value
    // this.loaded to true.
    function(table) {
      self.loaded = true;

      self.organizedData = self.organizeData(table);

      console.log(self.organizedData)
    });

  };

  //function to organized the raw data in object format
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

  this.setup = function() {
    // Font defaults.
    textSize(16);

    //set the values of the top x axis


    //set the values of the bottom x axis


    //set the values of the y axis

  };

  this.destroy = function() {
  };
};
