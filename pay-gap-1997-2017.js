function PayGapTimeSeries() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Pay gap: 1997-2017';
  
    // Unique ID for the visualization.
    this.id = 'pay-gap-timeseries';
  
    // Title to display above the plot.
    this.title = 'Gender Pay Gap: Average difference between male and female pay.';
  
    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = '%';
  
    // Layout object to store all common plot layout parameters and methods.
    var marginSize = 35;
    this.layout = {
      marginSize: marginSize,
  
      leftMargin: marginSize * 2,
      rightMargin: width - marginSize,
      topMargin: marginSize + 20,
      bottomMargin: height - marginSize * 2,
      pad: 5,
      // If true, draw a background grid.
      grid: true,
      // Number of axis tick labels to draw.
      numXTickLabels: 10,
      numYTickLabels: 8,
      // Helper to compute the width of the plot
      plotWidth: function() {
        return this.rightMargin - this.leftMargin;
      },
      // Helper to compute the height of the plot
      plotHeight: function() {
        return this.bottomMargin - this.topMargin;
      }
    };
  
    // Data loading flag
    this.loaded = false;
  
    // UI elements for interactivity
      this.dataPoints = [];          // We'll store (x, y, year, payGap) for hover
  
    // Preload the data. This function is called automatically by the gallery when a visualization is added.
    this.preload = function() {
      var self = this;
      this.data = loadTable(
        './data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv',
        'csv',
        'header',
        function(table) {
          self.loaded = true;
        }
      );
    };
  
    // Setup logic, called after preload
    this.setup = function() {
      // If data isn't loaded, do nothing
      if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }
  
      // Font defaults
      textSize(16);
  
      // Determine the min and max years from the data
      this.startYear = this.data.getNum(0, 'year');
      this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
  
      // The pay gap ranges from 0% to some maximum
      this.minPayGap = 0;
      this.maxPayGap = max(this.data.getColumn('pay_gap'));
  
      // We can store all data point positions for hover detection
      this.createDataPointsArray();
    };
  
    // Helper to create an array of data point positions for hover detection
    this.createDataPointsArray = function() {
      // We'll fill an array with { x, y, year, payGap }
      this.dataPoints = [];
  
      // We'll need the previous row to draw lines
      let previous = null;
      let numYears = this.endYear - this.startYear;
  
      for (var i = 0; i < this.data.getRowCount(); i++) {
        var current = {
          year: this.data.getNum(i, 'year'),
          payGap: this.data.getNum(i, 'pay_gap')
        };
  
        // Convert data to x, y coordinates
        let x = this.mapYearToWidth(current.year);
        let y = this.mapPayGapToHeight(current.payGap);
  
        // Store for hover detection
        this.dataPoints.push({
          x: x,
          y: y,
          year: current.year,
          payGap: current.payGap
        });
  
        previous = current;
      }
    };
  
    // ----------------------------------------
    // DESTROY (CLEANUP WHEN SWITCHING VISUALS) 
    // ----------------------------------------
    this.destroy = function () {
      console.log("PayGapTimeSeries destroy() called - Enhanced Reset");
  
      // Reset p5.js drawing states, especially those used in tooltips and drawing
      textSize(16);
      textFont('Arial'); // Or your default font
      textAlign(LEFT, TOP);
      rectMode(CORNER);
      ellipseMode(CENTER);
      fill(0);
      stroke(0);
      strokeWeight(1);
      colorMode(RGB, 255);
      cursor(ARROW);
      angleMode(RADIANS);
    };
  
  
    // Main draw function
    this.draw = function() {
      if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }
  
      // **Removed the gradient background call here:**
      // this.drawGradientBackground();
  
      // Set background to white (or any solid color you prefer if no gradient)
      background(255); // White background
  
      // Draw the title above the plot.
      this.drawTitle();
  
      // Draw y-axis tick labels, x/y axes, and axis labels
      drawYAxisTickLabels(this.minPayGap,
                          this.maxPayGap,
                          this.layout,
                          this.mapPayGapToHeight.bind(this),
                          0);
      drawAxis(this.layout);
      drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
  
      // We'll now draw the line segments from year to year
      this.drawPayGapLine();
  
      // We'll also draw circles for each data point for clarity
      this.drawDataPointCircles();
  
      // Finally, check if the mouse is hovering near any data point
      // and display a tooltip if so
      this.handleHoverTooltip();
    };
  
    // Draw the main title
    this.drawTitle = function() {
      fill(0);
      noStroke();
      textAlign('center', 'center');
      textSize(16);
      text(this.title,
           (this.layout.plotWidth() / 2) + this.layout.leftMargin,
           this.layout.topMargin - (this.layout.marginSize / 2));
    };
  
    // Convert a year (1997..2017) to an x-coordinate
    this.mapYearToWidth = function(value) {
      return map(value,
                 this.startYear,
                 this.endYear,
                 this.layout.leftMargin,   // Draw left-to-right from margin.
                 this.layout.rightMargin);
    };
  
    // Convert a pay gap value (0..some max) to a y-coordinate
    this.mapPayGapToHeight = function(value) {
      return map(value,
                 this.minPayGap,
                 this.maxPayGap,
                 this.layout.bottomMargin, // smaller gap near bottom
                 this.layout.topMargin);   // larger gap near top
    };
  
    // Draw the pay gap line by connecting consecutive data points
    this.drawPayGapLine = function() {
      // We'll loop over dataPoints and connect consecutive points
      stroke(0);
      for (let i = 0; i < this.dataPoints.length - 1; i++) {
        let curr = this.dataPoints[i];
        let next = this.dataPoints[i+1];
        line(curr.x, curr.y, next.x, next.y);
      }
  
      // We'll also draw x-axis tick labels for every so many years
      let numYears = this.endYear - this.startYear;
      let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
  
      // For each data point, if i is multiple of xLabelSkip, draw a tick label
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        let indexYear = dp.year - this.startYear;
        if (indexYear % xLabelSkip == 0) {
          drawXAxisTickLabel(dp.year, this.layout, this.mapYearToWidth.bind(this));
        }
      }
    };
  
    // Draw circles at each data point for clarity
    this.drawDataPointCircles = function() {
      noStroke();
      fill(0);
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        ellipse(dp.x, dp.y, 5, 5);
      }
    };
  
  
    // Check if the mouse is near any data point and display a tooltip
    this.handleHoverTooltip = function() {
      // We'll consider a radius of ~8 px for "hover"
      let hoverRadius = 8;
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        let d = dist(mouseX, mouseY, dp.x, dp.y);
        if (d < hoverRadius) {
          // Highlight the point
          fill(255, 0, 0);
          noStroke();
          ellipse(dp.x, dp.y, 8, 8);
  
          // Create a tooltip above the point
          let tooltipText = `Year: ${dp.year}\nGap: ${dp.payGap.toFixed(1)}%`;
          let tipW = textWidth('Year: 0000  Gap: 00.0%') + 10;
          let tipH = 32;
  
          fill(255, 255, 200);
          stroke(0);
          strokeWeight(0.5);
          rectMode(CENTER);
          rect(dp.x, dp.y - 35, tipW, tipH, 4);
  
          // Now place the text
          fill(0);
          noStroke();
          textSize(12);
          textAlign(CENTER, CENTER);
          // We'll draw multi-line text by splitting on '\n'
          let lines = tooltipText.split('\n');
          let lineHeight = 14;
          for (let j = 0; j < lines.length; j++) {
            text(lines[j], dp.x, (dp.y - 35) - (lineHeight*(lines.length-1)/2) + (j*lineHeight));
          }
  
          // Stop checking once we find a hovered point
          return;
        }
      }
    };
  }