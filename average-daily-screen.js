//
// AverageDailyScreen.js
// ----------------------
// This class handles loading data from a CSV file containing
// average daily screen time. It displays either the top 6 countries
// for a chosen year or the screen times by country for a chosen
// age group and year. A radar chart is used to visualize the data.
//

function AverageDailyScreen() {
  // Name for the visualization to appear in the menu bar.
  this.name = 'Average Daily Screen';

  // Each visualization must have a unique ID with no special characters.
  this.id = 'average-daily-screen';

  // Flags and data
  // --------------
  // Data loading status
  this.loaded = false;
  // Table data loaded from CSV
  this.data = null;

  // The selected age group, if any
  this.selectedAgeGroup = null;
  // The selected year, if an age group is chosen
  this.selectedYear = null;
  // The current year for top 6 countries (slider)
  this.currentYear = 2020;

  // Year slider (for top 6 countries)
  this.yearSlider = null;
  // Age group dropdown
  this.ageGroupSelect = null;
  // Year dropdown (appears if an age group is chosen)
  this.yearSelect = null;

  // Radar chart object
  this.radarChart = null;
  // Progress for animating the chart from 0..1
  this.animationProgress = 0;

  // Prevent multiple setups
  this.uiInitialized = false;

  // ----------------------------------------
  // PRELOAD: Load the CSV data
  // ----------------------------------------
  this.preload = function () {
    const self = this;
    this.data = loadTable(
      './data/average-daily-screen-time/average-daily-screen-time.csv',
      'csv',
      'header',
      function (table) {
        // If successful, mark as loaded
        self.loaded = true;
      },
      function (err) {
        // If there's an error, log it
        console.error('Error loading CSV:', err);
      }
    );
  };

  // ----------------------------------------
  // SETUP: Initialize UI elements
  // ----------------------------------------
  this.setup = function () {
    // Only run once, after data is loaded
    if (!this.loaded || this.uiInitialized) {
      return;
    }
    this.uiInitialized = true;

    // Positioning for the slider and dropdowns
    const sliderX = 350;
    const sliderY = 120;
    const ageGroupX = 350;
    const ageGroupY = 150;
    const yearSelectX = 350;
    const yearSelectY = 170;

    // 1) Create the slider for “Top 6” year selection
    //    Hides if an age group is selected
    this.yearSlider = createSlider(2020, 2024, this.currentYear, 1);
    this.yearSlider.position(sliderX, sliderY);
    // The style line is somewhat unusual; it sets CSS. We'll keep it as is.
    this.yearSlider.style('176.25', '27px');
    this.yearSlider.input(this.onYearChange.bind(this));

    // 2) Create the age group dropdown
    this.ageGroupSelect = createSelect();
    this.ageGroupSelect.position(ageGroupX, ageGroupY);
    this.ageGroupSelect.style('font-size', '14px');
    this.ageGroupSelect.option('Select Age Group');
    this.populateAgeGroupOptions();
    this.ageGroupSelect.changed(this.ageGroupSelected.bind(this));

    // 3) Create the Radar chart around (437, 300) with diameter 250
    this.radarChart = new RadarChart(437, 300, 250);

    // Force an initial draw
    this.draw();
  };

  // ----------------------------------------
  // POPULATE AGE GROUP OPTIONS
  // ----------------------------------------
  // This function scans the CSV data for all age groups
  // that have at least 3 countries from 2020..2024
  this.populateAgeGroupOptions = function () {
    if (!this.loaded || !this.ageGroupSelect) return;

    // We'll gather all age groups that appear with >= 3 countries
    let ageGroups = new Set();
    for (let year = 2020; year <= 2024; year++) {
      let yearData = this.data.getRows().filter(row => row.getNum('Year') === year);
      for (let row of yearData) {
        let ageGroup = row.getString('Age_Group');
        let countriesForAgeGroup = new Set(
          yearData
            .filter(r => r.getString('Age_Group') === ageGroup)
            .map(r => r.getString('Country'))
        );
        // If there are at least 3 countries for that age group in that year
        if (countriesForAgeGroup.size >= 3) {
          ageGroups.add(ageGroup);
        }
      }
    }

    // We'll sort them numerically by the first number (like 18, 25, etc.)
    let sortedAgeGroups = Array.from(ageGroups).sort((a, b) => {
      let aNum = parseInt(a.match(/\d+/)[0]);
      let bNum = parseInt(b.match(/\d+/)[0]);
      return aNum - bNum;
    });

    // Populate the dropdown
    for (let ageGroup of sortedAgeGroups) {
      this.ageGroupSelect.option(ageGroup);
    }
  };

  // ----------------------------------------
  // EVENT: AGE GROUP SELECTED
  // ----------------------------------------
  // If an age group is chosen, hide the year slider and show a year dropdown
  // Otherwise, revert to the “Top 6 countries” slider approach
  this.ageGroupSelected = function () {
    if (!this.ageGroupSelect) return;
    const chosen = this.ageGroupSelect.value();
    this.animationProgress = 0; // reset animation

    if (chosen && chosen !== 'Select Age Group') {
      this.selectedAgeGroup = chosen;

      // Hide the slider if an age group is chosen
      if (this.yearSlider) {
        this.yearSlider.hide();
      }

      // Remove any existing year dropdown
      if (this.yearSelect) {
        this.yearSelect.remove();
        this.yearSelect = null;
      }

      // Create a new year dropdown for the chosen age group
      this.createYearSelectDropdown();
    } else {
      // Revert to “Top 6 countries” approach
      this.selectedAgeGroup = null;
      if (this.yearSelect) {
        this.yearSelect.remove();
        this.yearSelect = null;
      }
      // Show the slider again
      if (this.yearSlider) {
        this.yearSlider.show();
      }
      this.selectedYear = null;
    }

    this.draw();
  };

  // ----------------------------------------
  // CREATE YEAR SELECT DROPDOWN
  // ----------------------------------------
  // If an age group is chosen, we show a dropdown of valid years
  this.createYearSelectDropdown = function () {
    const yearSelectX = 350;
    const yearSelectY = 107;

    this.yearSelect = createSelect();
    this.yearSelect.position(yearSelectX, yearSelectY);
    this.yearSelect.style('font-size', '14px');

    // Filter the data for only this age group
    let validYears = new Set();
    let filteredData = this.data
      .getRows()
      .filter(row => row.getString('Age_Group') === this.selectedAgeGroup);

    // Gather all the years that appear
    for (let row of filteredData) {
      validYears.add(row.getNum('Year'));
    }

    // For each year from 2020..2024, only add if there's >= 3 countries
    for (let year = 2020; year <= 2024; year++) {
      if (validYears.has(year)) {
        let yearData = filteredData.filter(r => r.getNum('Year') === year);
        let countriesForYear = new Set(yearData.map(r => r.getString('Country')));
        if (countriesForYear.size >= 3) {
          this.yearSelect.option(year, year);
        }
      }
    }

    this.yearSelect.changed(this.onYearSelectChange.bind(this));

    // Auto‐select the first option if it exists
    let options = this.yearSelect.elt.options;
    if (options.length > 0) {
      this.yearSelect.selected(options[0].value);
      this.selectedYear = parseInt(options[0].value, 10);
    } else {
      this.selectedYear = null;
    }
  };

  // ----------------------------------------
  // EVENT: YEAR SELECT DROPDOWN CHANGE
  // ----------------------------------------
  // When the user picks a new year for the chosen age group
  this.onYearSelectChange = function () {
    if (this.yearSelect) {
      this.selectedYear = parseInt(this.yearSelect.value(), 10);
      this.animationProgress = 0; // reset animation
      this.draw();
    }
  };

  // ----------------------------------------
  // EVENT: YEAR SLIDER CHANGE
  // ----------------------------------------
  // If no age group is selected, the user can pick a year from the slider
  this.onYearChange = function () {
    this.currentYear = parseInt(this.yearSlider.value(), 10);
    this.animationProgress = 0; // reset animation
    this.draw();
  };

  // ----------------------------------------
  // DESTROY (CLEANUP WHEN SWITCHING VISUALS)
  // ----------------------------------------
  // Remove UI elements and mark uninitialized
  this.destroy = function () {
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
    this.uiInitialized = false;
  };

  // ----------------------------------------
  // DRAW: Main rendering function
  // ----------------------------------------
  // Either shows top 6 countries for currentYear or
  // the data for the selectedAgeGroup in the selectedYear
  this.draw = function () {
    // If not loaded or not ready, show a "Loading" message
    if (!this.loaded || !this.uiInitialized) {
      background(255);
      textAlign(CENTER, CENTER);
      textSize(16);
      text('Loading data...', width / 2, height / 2);
      return;
    }

    // 1) Draw the background gradient
    drawGradientBackground();

    // 2) Main heading at the top
    fill(0);
    noStroke();
    textSize(20);
    textAlign(CENTER, TOP);
    text('Average Daily Screen Time Visualization', width / 2, 10);

    // Arrays to store data and labels for the radar chart
    let radarData = [];
    let radarLabels = [];
    let chartTitle = '';

    // CASE 1: A valid age group is selected
    if (this.selectedAgeGroup) {
      let yearToUse = this.selectedYear !== null ? this.selectedYear : 2020;

      // Filter data for the chosen age group & year
      let filteredData = this.data
        .getRows()
        .filter(
          row =>
            row.getString('Age_Group') === this.selectedAgeGroup &&
            row.getNum('Year') === yearToUse
        );

      // Aggregate screen time by country
      let countryData = new Map();
      for (let row of filteredData) {
        let country = row.getString('Country');
        let screenTime = row.getNum('Screen_Time_Hours');
        if (countryData.has(country)) {
          countryData.set(country, countryData.get(country) + screenTime);
        } else {
          countryData.set(country, screenTime);
        }
      }

      // Convert aggregated data into arrays
      for (let [country, totalScreenTime] of countryData) {
        let rowCount = filteredData.filter(r => r.getString('Country') === country).length;
        radarData.push(totalScreenTime / rowCount);
        radarLabels.push(country);
      }

      // Create a dynamic chart title
      chartTitle = `Screen Time: ${this.selectedAgeGroup} (${yearToUse})`;

    }
    // CASE 2: No valid age group => show top 6 countries for the slider year
    else {
      let yearData = this.data
        .getRows()
        .filter(row => row.getNum('Year') === this.currentYear);

      // Sum screen time by country
      let countryData = new Map();
      for (let row of yearData) {
        let country = row.getString('Country');
        let screenTime = row.getNum('Screen_Time_Hours');
        if (countryData.has(country)) {
          countryData.set(country, countryData.get(country) + screenTime);
        } else {
          countryData.set(country, screenTime);
        }
      }

      // Turn map into array
      let aggregated = [];
      for (let [country, totalScreenTime] of countryData) {
        let rowCount = yearData.filter(r => r.getString('Country') === country).length;
        aggregated.push({
          country,
          screenTime: totalScreenTime / rowCount
        });
      }

      // Sort descending, take top 6
      aggregated.sort((a, b) => b.screenTime - a.screenTime);
      aggregated = aggregated.slice(0, 6);

      // Prepare for the radar chart
      for (let item of aggregated) {
        radarData.push(item.screenTime);
        radarLabels.push(item.country);
      }

      // Dynamic chart title for top 6
      chartTitle = `Top 6 Countries (${this.currentYear})`;

      // Show the slider’s year label near the slider
      fill(0);
      noStroke();
      textSize(14);
      textAlign(LEFT, CENTER);
      text(`Year: ${this.currentYear}`, this.yearSlider.x - 305, this.yearSlider.y - 20);
    }

    // Draw a semi‐transparent rectangle behind the chart title
    fill(255, 180);
    noStroke();
    rectMode(CENTER);
    let tw = textWidth(chartTitle) + 20;
    rect(437, 103, tw, 30, 8);

    // Draw the chart title at (437, 103)
    fill(0);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(chartTitle, 437, 103);

    // Animate & draw the radar chart if we have data
    if (radarData.length > 0) {
      if (this.animationProgress < 1) {
        this.animationProgress += 0.02;
        this.animationProgress = min(this.animationProgress, 1);
      }
      let animatedRadarData = radarData.map(val => val * this.animationProgress);
      // Draw the radar chart with an empty internal title (we already drew it above)
      this.radarChart.draw(animatedRadarData, radarLabels, '');
    }

    // Tooltip on Hover
    if (radarData.length > 0) {
      let angleStep = TWO_PI / radarData.length;
      for (let i = 0; i < radarData.length; i++) {
        let scaledValue = map(
          radarData[i] * this.animationProgress,
          0,
          this.radarChart.maxValue,
          0,
          this.radarChart.diameter / 2
        );
        let px = this.radarChart.x + cos(i * angleStep - HALF_PI) * scaledValue;
        let py = this.radarChart.y + sin(i * angleStep - HALF_PI) * scaledValue;

        // Check if the mouse is near a vertex
        let distance = dist(mouseX, mouseY, px, py);
        if (distance < 10) {
          cursor('pointer');
          let tooltipText = `${radarLabels[i]}: ${radarData[i].toFixed(2)} hrs`;
          let tipW = textWidth(tooltipText) + 12;
          let tipH = 22;

          fill(255, 220);
          noStroke();
          rectMode(CENTER);
          rect(px, py - 14, tipW, tipH, 5);

          fill(0);
          textSize(12);
          textAlign(CENTER, CENTER);
          text(tooltipText, px, py - 14);

          return; // Stop once we find the hovered vertex
        }
      }
      cursor(ARROW);
    }

    // --- Display Raw Screen_Time_Hours Data alongside Radar Chart ---
    // This block displays the aggregated or average screen time values
    // as text next to the radar chart for clarity.
    let dataStartX = this.radarChart.x + this.radarChart.diameter / 2 + 90;
    let dataStartY = this.radarChart.y - this.radarChart.diameter / 2;
    fill(0);
    textSize(12);
    textAlign(LEFT, TOP);
    text("Screen_Time_Hours Data:", dataStartX, dataStartY);

    for (let i = 0; i < radarLabels.length; i++) {
      text(`${radarLabels[i]}: ${radarData[i].toFixed(2)} hrs`, dataStartX, dataStartY + 18 * (i + 1));
    };
  };

  // ----------------------------------------
  // Helper: Draw a subtle vertical gradient
  // ----------------------------------------
  function drawGradientBackground() {
    let topC = color(220, 240, 255);
    let botC = color(255, 255, 255);

    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(topC, botC, inter);
      stroke(c);
      line(0, y, width, y);
    };
  };
};
  