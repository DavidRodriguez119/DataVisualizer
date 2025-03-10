//
// AverageDailyScreen.js
//

function AverageDailyScreen() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Average Daily Screen';

  // Each visualisation must have a unique ID with no special characters.
  this.id = 'average-daily-screen';

  // Data and table objects for screen time data.
  this.data = null;
  this.loaded = false;

  // Value for the current year displayed.
  this.currentYear = 2020;

  // The selected age group, default null for top 6 countries view
  this.selectedAgeGroup = null;
  // The selected year if an age group is selected
  this.selectedYear = null;

  // UI Elements: slider and dropdowns
  this.yearSlider = null;
  this.ageGroupSelect = null;
  this.yearSelect = null;

  // Radar chart object
  this.radarChart = null;
  this.animationProgress = 0; // Animation progress for radar chart

  // Prevent multiple setup calls
  this.uiInitialized = false;


  // Preload data table from CSV file
  this.preload = function() {
    const self = this;
    this.data = loadTable(
      './data/average-daily-screen-time/average-daily-screen-time.csv',
      'csv',
      'header',
      // Callback function to set loaded to true when data is loaded
      function(table) {
        self.loaded = true;
      },
      // Error callback if data loading fails
      function(error) {
        console.error("Data loading error:", error);
      }
    );
  };


  this.setup = function() {
    // Ensure setup only runs once and data is loaded
    if (!this.loaded || this.uiInitialized) {
      return;
    }
    this.uiInitialized = true;

    // UI Element positions
    const sliderX = 350;
    const sliderY = 120;
    const ageGroupDropdownX = 350;
    const ageGroupDropdownY = 150;
    const yearDropdownX = 350;
    const yearDropdownY = 170;


    // Create year slider for "Top 6" view, hidden when age group selected
    this.yearSlider = createSlider(2020, 2024, this.currentYear, 1);
    this.yearSlider.position(sliderX, sliderY);
    this.yearSlider.style('width', '176.25px'); // Consistent width style
    this.yearSlider.input(this.onYearSliderChange.bind(this));


    // Create age group dropdown
    this.ageGroupSelect = createSelect();
    this.ageGroupSelect.position(ageGroupDropdownX, ageGroupDropdownY);
    this.ageGroupSelect.style('font-size', '14px');
    this.ageGroupSelect.option('Select Age Group');
    this.populateAgeGroupDropdown(); // Populate options based on data
    this.ageGroupSelect.changed(this.onAgeGroupDropdownChange.bind(this));


    // Radar chart initialization, position and diameter
    this.radarChart = new RadarChart(437, 300, 250);

    // Initial draw call to render the visualization
    this.draw();
  };


  // Populates age group dropdown with valid age groups from the dataset.
  this.populateAgeGroupDropdown = function() {
    if (!this.loaded || !this.ageGroupSelect) {
      return; // Ensure data loaded and dropdown exists
    }

    let ageGroups = new Set(); // Use a set to avoid duplicates
    for (let year = 2020; year <= 2024; year++) {
      let yearData = this.data.getRows().filter(row => row.getNum('Year') === year);
      for (let row of yearData) {
        let ageGroup = row.getString('Age_Group');
        // Check if age group has at least 3 countries in data for any year 2020-2024
        let countriesForAgeGroup = new Set(
          yearData
            .filter(r => r.getString('Age_Group') === ageGroup)
            .map(r => r.getString('Country'))
        );
        if (countriesForAgeGroup.size >= 3) {
          ageGroups.add(ageGroup);
        }
      }
    }

    // Sort age groups numerically (based on starting age)
    let sortedAgeGroups = Array.from(ageGroups).sort((a, b) => {
      let aNum = parseInt(a.match(/\d+/)[0]); // Extract number from age group string
      let bNum = parseInt(b.match(/\d+/)[0]);
      return aNum - bNum;
    });

    // Add sorted age groups as options to the dropdown
    for (let ageGroup of sortedAgeGroups) {
      this.ageGroupSelect.option(ageGroup);
    }
  };


  // Handles event when age group is selected from dropdown.
  this.onAgeGroupDropdownChange = function() {
    if (!this.ageGroupSelect) {
      return; // Exit if dropdown is not initialized
    }
    const selectedGroup = this.ageGroupSelect.value();
    this.animationProgress = 0; // Reset animation

    if (selectedGroup && selectedGroup !== 'Select Age Group') {
      // Valid age group selected
      this.selectedAgeGroup = selectedGroup;

      // Hide year slider, show year dropdown
      if (this.yearSlider) {
        this.yearSlider.hide();
      }
      if (this.yearSelect) {
        this.yearSelect.remove();
        this.yearSelect = null;
      }
      this.createYearDropdown(); // Create year dropdown for selected age group

    } else {
      // "Select Age Group" or no selection, revert to "Top 6" view
      this.selectedAgeGroup = null;
      if (this.yearSelect) {
        this.yearSelect.remove();
        this.yearSelect = null;
      }
      if (this.yearSlider) {
        this.yearSlider.show(); // Show year slider again
      }
      this.selectedYear = null;
    }

    this.draw(); // Redraw visualization
  };


  // Creates year dropdown, populated with valid years for selected age group.
  this.createYearDropdown = function() {
    const yearDropdownX = 350;
    const yearDropdownY = 107;

    this.yearSelect = createSelect();
    this.yearSelect.position(yearDropdownX, yearDropdownY);
    this.yearSelect.style('font-size', '14px');


    // Filter data for the selected age group
    let validYears = new Set();
    let filteredData = this.data.getRows().filter(
      row => row.getString('Age_Group') === this.selectedAgeGroup
    );


    // Collect all years available for this age group
    for (let row of filteredData) {
      validYears.add(row.getNum('Year'));
    }

    // Add years to dropdown if they have data for at least 3 countries
    for (let year = 2020; year <= 2024; year++) {
      if (validYears.has(year)) {
        let yearData = filteredData.filter(r => r.getNum('Year') === year);
        let countriesInYear = new Set(yearData.map(r => r.getString('Country')));
        if (countriesInYear.size >= 3) {
          this.yearSelect.option(year, year); // Add year to dropdown
        }
      }
    }


    this.yearSelect.changed(this.onYearDropdownChange.bind(this));

    // Auto-select first year option if available
    let options = this.yearSelect.elt.options;
    if (options.length > 0) {
      this.yearSelect.selected(options[0].value);
      this.selectedYear = parseInt(options[0].value, 10);
    } else {
      this.selectedYear = null;
    }
  };


  // Handles event when year is selected from the year dropdown.
  this.onYearDropdownChange = function() {
    if (this.yearSelect) {
      this.selectedYear = parseInt(this.yearSelect.value(), 10);
      this.animationProgress = 0; // Reset animation
      this.draw(); // Redraw visualization
    }
  };


  // Handles event when year slider value changes.
  this.onYearSliderChange = function() {
    this.currentYear = parseInt(this.yearSlider.value(), 10);
    this.animationProgress = 0; // Reset animation
    this.draw(); // Redraw visualization
  };


  this.destroy = function () {
    console.log("AverageDailyScreen destroy() called - Less Aggressive Reset");

    // 1. Remove UI elements
    if (this.yearSlider) {
      this.yearSlider.remove();
      this.yearSlider = null;
    }
    if (this.ageGroupSelect) {
      this.ageGroupSelect.remove();
      this.ageGroupSelect = null;
    }
    if (this.yearSelect) {
      this.yearSelect.remove();
      this.yearSelect = null;
    }

    // 2. Reset SOME flags and data (modified - NOT resetting loaded/data)
    this.uiInitialized = false;
    // this.loaded = false;     // **DO NOT RESET loaded** - Keep data loaded
    // this.data = null;        // **DO NOT RESET data** - Keep data in memory
    this.selectedAgeGroup = null;
    this.selectedYear = null;
    this.currentYear = 2020;
    this.animationProgress = 0;
    this.radarChart = null;

    // 3. **Aggressively Reset p5.js Drawing States**
    // Reset text styles
    textSize(16);
    textFont('Arial');
    textAlign(LEFT, TOP);

    // Reset shape styles
    rectMode(CORNER);
    ellipseMode(CENTER);

    // Reset color and stroke
    fill(0);
    stroke(0);
    strokeWeight(1);
    noStroke();

    colorMode(RGB, 255);

    // Reset cursor
    cursor(ARROW);

    // Reset angle mode
    angleMode(RADIANS);
  };


  // Main render function
  this.draw = function() {
    // If data not loaded or setup not complete, display loading message
    if (!this.loaded || !this.uiInitialized) {
      background(255);
      textAlign(CENTER, CENTER);
      textSize(16);
      text('Loading data...', width / 2, height / 2);
      return;
    }


    // Draw background gradient
    this.drawGradientBackground();

    // Visualization title
    fill(0);
    noStroke();
    textSize(20);
    textAlign(CENTER, TOP);
    text('Average Daily Screen Time Visualization', width / 2, 10);


    let radarChartData = []; // Data for radar chart
    let radarChartLabels = []; // Labels for radar chart
    let chartTitle = '';     // Dynamic chart title


    // Case 1: Age group selected, show data for selected year (or default 2020)
    if (this.selectedAgeGroup) {
      let yearForData = this.selectedYear !== null ? this.selectedYear : 2020;

      // Filter data for selected age group and year
      let filteredYearData = this.data.getRows().filter(
        row => row.getString('Age_Group') === this.selectedAgeGroup && row.getNum('Year') === yearForData
      );

      // Aggregate screen time by country
      let aggregatedCountryData = new Map();
      for (let row of filteredYearData) {
        let country = row.getString('Country');
        let screenTime = row.getNum('Screen_Time_Hours');
        if (aggregatedCountryData.has(country)) {
          aggregatedCountryData.set(country, aggregatedCountryData.get(country) + screenTime);
        } else {
          aggregatedCountryData.set(country, screenTime);
        }
      }


      // Convert aggregated map data to arrays for radar chart
      for (let [country, totalScreenTime] of aggregatedCountryData) {
        let rowCount = filteredYearData.filter(r => r.getString('Country') === country).length;
        radarChartData.push(totalScreenTime / rowCount); // Average screen time
        radarChartLabels.push(country);
      }


      // Set chart title dynamically based on selection
      chartTitle = `Screen Time: ${this.selectedAgeGroup} (${yearForData})`;
    }
    // Case 2: No age group selected, show top 6 countries for selected year
    else {
      let yearData = this.data.getRows().filter(row => row.getNum('Year') === this.currentYear);


      // Aggregate screen time by country for top countries view
      let aggregatedCountryData = new Map();
      for (let row of yearData) {
        let country = row.getString('Country');
        let screenTime = row.getNum('Screen_Time_Hours');
        if (aggregatedCountryData.has(country)) {
          aggregatedCountryData.set(country, aggregatedCountryData.get(country) + screenTime);
        } else {
          aggregatedCountryData.set(country, screenTime);
        }
      }

      // Convert aggregated data to array and calculate average
      let aggregatedArray = [];
      for (let [country, totalScreenTime] of aggregatedCountryData) {
        let rowCount = yearData.filter(r => r.getString('Country') === country).length;
        aggregatedArray.push({
          country: country,
          screenTime: totalScreenTime / rowCount // Average screen time per country
        });
      }


      // Sort by screen time, get top 6 countries
      aggregatedArray.sort((a, b) => b.screenTime - a.screenTime);
      aggregatedArray = aggregatedArray.slice(0, 6);


      // Prepare data and labels for radar chart from top countries
      for (let item of aggregatedArray) {
        radarChartData.push(item.screenTime);
        radarChartLabels.push(item.country);
      }


      // Set chart title for top countries view
      chartTitle = `Top 6 Countries (${this.currentYear})`;

      // Display year near slider in "Top 6" view
      fill(0);
      noStroke();
      textSize(14);
      textAlign(LEFT, CENTER);
      text(`Year: ${this.currentYear}`, this.yearSlider.x - 305, this.yearSlider.y - 20);
    }


    // Semi-transparent background for chart title
    fill(255, 180);
    noStroke();
    rectMode(CENTER);
    let titleWidth = textWidth(chartTitle) + 20;
    rect(437, 103, titleWidth, 30, 8);


    // Draw chart title
    fill(0);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(chartTitle, 437, 103);


    // Animate and draw radar chart if data exists
    if (radarChartData.length > 0) {
      if (this.animationProgress < 1) {
        this.animationProgress += 0.02;
        this.animationProgress = min(this.animationProgress, 1);
      }
      // Animate data values for radar chart
      let animatedChartData = radarChartData.map(val => val * this.animationProgress);
      this.radarChart.draw(animatedChartData, radarChartLabels, ''); // Draw radar chart
    }


    // Tooltip functionality for radar chart vertices
    if (radarChartData.length > 0) {
      let angleStep = TWO_PI / radarChartData.length;
      for (let i = 0; i < radarChartData.length; i++) {
        // Calculate vertex position for tooltip check
        let vertexValue = map(
          radarChartData[i] * this.animationProgress,
          0,
          this.radarChart.maxValue,
          0,
          this.radarChart.diameter / 2
        );
        let vertexX = this.radarChart.x + cos(i * angleStep - HALF_PI) * vertexValue;
        let vertexY = this.radarChart.y + sin(i * angleStep - HALF_PI) * vertexValue;

        // Check mouse proximity to vertex
        let distanceToMouse = dist(mouseX, mouseY, vertexX, vertexY);
        if (distanceToMouse < 10) {
          cursor('pointer'); // Change cursor on hover
          let tooltipText = `${radarChartLabels[i]}: ${radarChartData[i].toFixed(2)} hrs`;
          let tooltipWidth = textWidth(tooltipText) + 12;
          let tooltipHeight = 22;

          // Tooltip background rectangle
          fill(255, 220);
          noStroke();
          rectMode(CENTER);
          rect(vertexX, vertexY - 14, tooltipWidth, tooltipHeight, 5);

          // Tooltip text
          fill(0);
          textSize(12);
          textAlign(CENTER, CENTER);
          text(tooltipText, vertexX, vertexY - 14);
          return; // Exit loop after displaying tooltip
        }
      }
      cursor(ARROW); // Reset cursor if no vertex hovered
    }


    // Display raw Screen_Time_Hours data values next to radar chart
    let dataDisplayStartX = this.radarChart.x + this.radarChart.diameter / 2 + 90;
    let dataDisplayStartY = this.radarChart.y - this.radarChart.diameter / 2;
    fill(0);
    textSize(12);
    textAlign(LEFT, TOP);
    text("Screen_Time_Hours Data:", dataDisplayStartX, dataDisplayStartY);

    // Output data values as text labels
    for (let i = 0; i < radarChartLabels.length; i++) {
      text(`${radarChartLabels[i]}: ${radarChartData[i].toFixed(2)} hrs`, dataDisplayStartX, dataDisplayStartY + 18 * (i + 1));
    }
  };


  // Draws a subtle vertical gradient background.
  this.drawGradientBackground = function() {
    let topColour = color(220, 240, 255);
    let bottomColour = color(255, 255, 255);

    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(topColour, bottomColour, inter);
      stroke(c);
      line(0, y, width, y);
    }
  };
}