function PayGapTimeSeries() {
    // VISUALISATION NAME
    this.name = 'Pay gap: 1997-2017';

    // UNIQUE ID FOR VISUALISATION
    this.id = 'pay-gap-timeseries';

    // TITLE TO DISPLAY ABOVE PLOT
    this.title = 'Gender Pay Gap: Average difference between male and female pay.';

    // AXIS LABELS
    this.xAxisLabel = 'year';
    this.yAxisLabel = '%';

    // PLOT LAYOUT OBJECT
    var marginSize = 35;
    this.layout = {
      marginSize: marginSize,

      leftMargin: marginSize * 2,
      rightMargin: width - marginSize,
      topMargin: marginSize + 20,
      bottomMargin: height - marginSize * 2,
      pad: 5,
      // SETS WHETHER TO DRAW BACKGROUND GRID
      grid: true,
      // DEFINE NUMBER OF TICK LABELS FOR X AXIS
      numXTickLabels: 10,
      // DEFINE NUMBER OF TICK LABELS FOR Y AXIS
      numYTickLabels: 8,
      // FUNCTION TO CALCULATE PLOT WIDTH
      plotWidth: function() {
        return this.rightMargin - this.leftMargin;
      },
      // FUNCTION TO CALCULATE PLOT HEIGHT
      plotHeight: function() {
        return this.bottomMargin - this.topMargin;
      }
    };

    // DATA LOADING FLAG
    this.loaded = false;

    // DATA POINTS FOR HOVER
      this.dataPoints = []; // We'll store (x, y, year, payGap) for hover

    // PRELOAD FUNCTION - LOADS DATA
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

    // SETUP FUNCTION - CALLED AFTER PRELOAD
    this.setup = function() {
      // CHECK IF DATA LOADED
      if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }

      // SET FONT DEFAULTS
      textSize(16);

      // DETERMINE MIN/MAX YEARS
      this.startYear = this.data.getNum(0, 'year');
      this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

      // PAY GAP RANGE
      this.minPayGap = 0;
      this.maxPayGap = max(this.data.getColumn('pay_gap'));

      // CREATE DATA POINTS ARRAY FOR HOVER
      this.createDataPointsArray();
    };

    // CREATE DATA POINTS ARRAY
    this.createDataPointsArray = function() {
      // ARRAY TO HOLD DATA POINT POSITIONS
      this.dataPoints = [];

      // NEED PREVIOUS ROW FOR LINES
      let previous = null;
      let numYears = this.endYear - this.startYear;

      // LOOP THROUGH DATA ROWS
      for (var i = 0; i < this.data.getRowCount(); i++) {
        var current = {
          year: this.data.getNum(i, 'year'),
          payGap: this.data.getNum(i, 'pay_gap')
        };

        // CONVERT DATA TO X, Y
        let x = this.mapYearToWidth(current.year);
        let y = this.mapPayGapToHeight(current.payGap);

        // STORE FOR HOVER DETECTION
        this.dataPoints.push({
          x: x,
          y: y,
          year: current.year,
          payGap: current.payGap
        });

        previous = current;
      }
    };

    // DESTROY FUNCTION - CLEANUP
    this.destroy = function () {
      console.log("PayGapTimeSeries destroy() called - Enhanced Reset");

      // RESET P5 DRAWING STATES
      textSize(16);
      textFont('Arial'); 
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


    // DRAW FUNCTION - MAIN RENDER LOOP
    this.draw = function() {
      // CHECK IF DATA LOADED
      if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }

      // SET BACKGROUND
      background(255);
      // DRAW PLOT TITLE
      this.drawTitle();

      // DRAW Y-AXIS LABELS, AXES
      drawYAxisTickLabels(this.minPayGap,
                          this.maxPayGap,
                          this.layout,
                          this.mapPayGapToHeight.bind(this),
                          0);
      drawAxis(this.layout);
      drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

      // DRAW PAY GAP LINE
      this.drawPayGapLine();

      // DRAW DATA POINT CIRCLES
      this.drawDataPointCircles();

      // HANDLE HOVER TOOLTIP
      this.handleHoverTooltip();
    };

    // DRAW PLOT TITLE FUNCTION
    this.drawTitle = function() {
      fill(0);
      noStroke();
      textAlign('center', 'center');
      textSize(16);
      text(this.title,
           (this.layout.plotWidth() / 2) + this.layout.leftMargin,
           this.layout.topMargin - (this.layout.marginSize / 2));
    };

    // MAP YEAR TO PLOT WIDTH
    this.mapYearToWidth = function(value) {
      return map(value,
                 this.startYear,
                 this.endYear,
                 this.layout.leftMargin,   
                 this.layout.rightMargin);
    };

    // MAP PAY GAP TO PLOT HEIGHT
    this.mapPayGapToHeight = function(value) {
      return map(value,
                 this.minPayGap,
                 this.maxPayGap,
                 this.layout.bottomMargin, 
                 this.layout.topMargin);   
    };

    // DRAW PAY GAP LINE FUNCTION
    this.drawPayGapLine = function() {
      // LOOP AND CONNECT DATA POINTS
      stroke(0);
      for (let i = 0; i < this.dataPoints.length - 1; i++) {
        let curr = this.dataPoints[i];
        let next = this.dataPoints[i+1];
        line(curr.x, curr.y, next.x, next.y);
      }

      // X-AXIS TICK LABELS
      let numYears = this.endYear - this.startYear;
      let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

      // DRAW LABELS BASED ON SKIP VALUE
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        let indexYear = dp.year - this.startYear;
        if (indexYear % xLabelSkip == 0) {
          drawXAxisTickLabel(dp.year, this.layout, this.mapYearToWidth.bind(this));
        }
      }
    };

    // DRAW DATA POINT CIRCLES FUNCTION
    this.drawDataPointCircles = function() {
      noStroke();
      fill(0);
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        ellipse(dp.x, dp.y, 5, 5);
      }
    };


    // HANDLE HOVER TOOLTIP FUNCTION
    this.handleHoverTooltip = function() {
      // HOVER RADIUS
      let hoverRadius = 8;
      for (let i = 0; i < this.dataPoints.length; i++) {
        let dp = this.dataPoints[i];
        let d = dist(mouseX, mouseY, dp.x, dp.y);
        if (d < hoverRadius) {
          // HIGHLIGHT POINT ON HOVER
          fill(255, 0, 0);
          noStroke();
          ellipse(dp.x, dp.y, 8, 8);

          // TOOLTIP TEXT
          let tooltipText = `Year: ${dp.year}\nGap: ${dp.payGap.toFixed(1)}%`;
          let tipW = textWidth('Year: 0000  Gap: 00.0%') + 10;
          let tipH = 32;

          // TOOLTIP RECTANGLE
          fill(255, 255, 200);
          stroke(0);
          strokeWeight(0.5);
          rectMode(CENTER);
          rect(dp.x, dp.y - 35, tipW, tipH, 4);

          // TOOLTIP TEXT DISPLAY
          fill(0);
          noStroke();
          textSize(12);
          textAlign(CENTER, CENTER);
          let lines = tooltipText.split('\n');
          let lineHeight = 14;
          for (let j = 0; j < lines.length; j++) {
            text(lines[j], dp.x, (dp.y - 35) - (lineHeight*(lines.length-1)/2) + (j*lineHeight));
          }

          // STOP CHECKING AFTER HOVER DETECTED
          return;
        }
      }
    };
  }