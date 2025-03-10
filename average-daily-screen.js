function AverageDailyScreen() {
    this.name = 'Average Daily Screen';
    this.id = 'average-daily-screen';
  
    // Data/loading flags
    this.loaded = false;
    this.data = null;
  
    // UI state
    this.selectedAgeGroup = null;
    this.selectedYear = null;
    this.currentYear = 2020;
  
    // UI elements
    this.yearSlider = null;
    this.ageGroupSelect = null;
    this.yearSelect = null;
  
    // Radar chart
    this.radarChart = null;
    this.animationProgress = 0;
  
    // For limiting repeated setup
    this.uiInitialized = false;
  
    // ----------------------------------------
    // PRELOAD
    // ----------------------------------------
    this.preload = function () {
      const self = this;
      this.data = loadTable(
        './data/average-daily-screen-time/average-daily-screen-time.csv',
        'csv',
        'header',
        function (table) {
          self.loaded = true;
        },
        function (err) {
          console.error('Error loading CSV:', err);
        }
      );
    };
  
    // ----------------------------------------
    // SETUP
    // ----------------------------------------
    this.setup = function () {
      // Only initialize once and only after data is loaded
      if (!this.loaded || this.uiInitialized) {
        return;
      }
      this.uiInitialized = true;
  
      // Positions & layout for UI elements
      const sliderX = 350;
      const sliderY = 120;
      const ageGroupX = 350;
      const ageGroupY = 150;
      const yearSelectX = 350;
      const yearSelectY = 170;
  
      // 1) Create the slider for “Top 6” year selection
      this.yearSlider = createSlider(2020, 2024, this.currentYear, 1);
      this.yearSlider.position(sliderX, sliderY);
      this.yearSlider.style('176.25', '27px');
      this.yearSlider.input(this.onYearChange.bind(this));
  
      // 2) Create the age group dropdown
      this.ageGroupSelect = createSelect();
      this.ageGroupSelect.position(ageGroupX, ageGroupY);
      this.ageGroupSelect.style('font-size', '14px');
      this.ageGroupSelect.option('Select Age Group');
      this.populateAgeGroupOptions();
      this.ageGroupSelect.changed(this.ageGroupSelected.bind(this));
  
      // 3) Radar chart around (437, 300)
      this.radarChart = new RadarChart(437, 300, 250);
  
      // Done with setup
      this.draw(); // initial draw
    };
  
    // ----------------------------------------
    // POPULATE AGE GROUP OPTIONS
    // ----------------------------------------
    this.populateAgeGroupOptions = function () {
      if (!this.loaded || !this.ageGroupSelect) return;
  
      // Identify all age groups that have data for 2020..2024 with at least 3 countries
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
          if (countriesForAgeGroup.size >= 3) {
            ageGroups.add(ageGroup);
          }
        }
      }
  
      // Sort age groups numerically by the first digit (e.g., "18-24" => 18, "25-34" => 25)
      let sortedAgeGroups = Array.from(ageGroups).sort((a, b) => {
        let aNum = parseInt(a.match(/\d+/)[0]);
        let bNum = parseInt(b.match(/\d+/)[0]);
        return aNum - bNum;
      });
  
      for (let ageGroup of sortedAgeGroups) {
        this.ageGroupSelect.option(ageGroup);
      }
    };
  
    // ----------------------------------------
    // EVENT: AGE GROUP SELECTED
    // ----------------------------------------
    this.ageGroupSelected = function () {
      if (!this.ageGroupSelect) return;
      const chosen = this.ageGroupSelect.value();
      this.animationProgress = 0;
  
      // If user picks a valid age group
      if (chosen && chosen !== 'Select Age Group') {
        this.selectedAgeGroup = chosen;
  
        // Hide the slider
        if (this.yearSlider) {
          this.yearSlider.hide();
        }
  
        // If there's an existing year dropdown, remove it
        if (this.yearSelect) {
          this.yearSelect.remove();
          this.yearSelect = null;
        }
  
        // Create a new year dropdown for the chosen age group
        this.createYearSelectDropdown();
      } else {
        // “Select Age Group” => revert to top 6
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
    this.createYearSelectDropdown = function () {
      // Position it below the age group dropdown
      const yearSelectX = 350;
      const yearSelectY = 107;
  
      this.yearSelect = createSelect();
      this.yearSelect.position(yearSelectX, yearSelectY);
      this.yearSelect.style('font-size', '14px');
  
      let validYears = new Set();
      let filteredData = this.data
        .getRows()
        .filter(row => row.getString('Age_Group') === this.selectedAgeGroup);
  
      for (let row of filteredData) {
        validYears.add(row.getNum('Year'));
      }
  
      // Add only the years with at least 3 countries for this age group
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
    this.onYearSelectChange = function () {
      if (this.yearSelect) {
        this.selectedYear = parseInt(this.yearSelect.value(), 10);
        this.animationProgress = 0;
        this.draw();
      }
    };
  
    // ----------------------------------------
    // EVENT: YEAR SLIDER CHANGE
    // ----------------------------------------
    this.onYearChange = function () {
      this.currentYear = parseInt(this.yearSlider.value(), 10);
      this.animationProgress = 0;
      this.draw();
    };
  
    // ----------------------------------------
    // DESTROY (CLEANUP WHEN SWITCHING VISUALS)
    // ----------------------------------------
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
    // DRAW
    // ----------------------------------------
    this.draw = function () {
      if (!this.loaded || !this.uiInitialized) {
        background(255);
        textAlign(CENTER, CENTER);
        textSize(16);
        text('Loading data...', width / 2, height / 2);
        return;
      }
  
      // 1) Draw a subtle vertical gradient
      drawGradientBackground();
  
      // 2) Draw a main heading at the top
      fill(0);
      noStroke();
      textSize(20);
      textAlign(CENTER, TOP);
      text('Average Daily Screen Time Visualization', width / 2, 10);
  
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
  
        // Average if needed
        for (let [country, totalScreenTime] of countryData) {
          let rowCount = filteredData.filter(r => r.getString('Country') === country).length;
          radarData.push(totalScreenTime / rowCount);
          radarLabels.push(country);
        }
  
        chartTitle = `Screen Time: ${this.selectedAgeGroup} (${yearToUse})`;
      }
      // CASE 2: No valid age group => top 6 countries for slider year
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
  
        // Prepare for radar
        for (let item of aggregated) {
          radarData.push(item.screenTime);
          radarLabels.push(item.country);
        }
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
  
      // Animate & Draw Radar
      if (radarData.length > 0) {
        if (this.animationProgress < 1) {
          this.animationProgress += 0.02;
          this.animationProgress = min(this.animationProgress, 1);
        }
        let animatedRadarData = radarData.map(val => val * this.animationProgress);
        // Pass an empty string for chart’s internal label
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
  
          let distance = dist(mouseX, mouseY, px, py);
          if (distance < 10) {
            cursor('pointer');
            let tooltipText = `${radarLabels[i]}: ${radarData[i].toFixed(2)} hrs`;
            let tipW = textWidth(tooltipText) + 12;
            let tipH = 22;
  
            fill(255, 220);
            noStroke();
            rectMode(CENTER);
            rect(px, py + 14, tipW, tipH, 5);
  
            fill(0);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(tooltipText, px, py + 14);
  
            return;
          }
        }
        cursor(ARROW);
      }
            // --- Display Raw Screen_Time_Hours Data alongside Radar Chart ---
      // This block displays the screen time values (aggregated) as text next to the radar chart.
      let dataStartX = this.radarChart.x + this.radarChart.diameter / 2 + 90;
      let dataStartY = this.radarChart.y - this.radarChart.diameter / 2;
      fill(0);
      textSize(12);
      textAlign(LEFT, TOP);
      text("Screen_Time_Hours Data:", dataStartX, dataStartY);
      for (let i = 0; i < radarLabels.length; i++) {
          text(`${radarLabels[i]}: ${radarData[i].toFixed(2)} hrs`, dataStartX, dataStartY + 18 * (i + 1));
      }
  
    };
  
    // ----------------------------------------
    // Helper: Subtle vertical gradient
    // ----------------------------------------
    function drawGradientBackground() {
      let topC = color(220, 240, 255);
      let botC = color(255, 255, 255);
  
      for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(topC, botC, inter);
        stroke(c);
        line(0, y, width, y);
      }
    }
  }
  