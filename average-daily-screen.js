// average-daily-screen.js
function AverageDailyScreen() {
  this.name = 'Average Daily Screen';
  this.id = 'average-daily-screen';

  this.loaded = false;
  this.data = null;
  this.currentYear = null;
  this.availableYears = [];
  this.selectedCountry = null;
  this.yearSlider = null;
  this.countrySelect = null;
  this.radarChart = null;
  this.animationProgress = 0; // For time-based animation

  this.preload = function() {
      var self = this;
      this.data = loadTable('./data/average-daily-screen-time/average-daily-screen-time.csv', 'csv', 'header',
          function(table) {
              self.loaded = true;
              let allYears = new Set();
              for (let i = 0; i < table.getRowCount(); i++) {
                  allYears.add(table.getNum(i, 'Year'));
              }
              self.availableYears = Array.from(allYears).filter(year => year >= 2000 && year <= 2025).sort((a, b) => b - a);
              if (self.availableYears.length > 0) {
                  self.currentYear = self.availableYears[0];
              }
          },
          function(err) {
              console.error("Error loading CSV:", err);
          }
      );
  };

  this.setup = function() {
      if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
      }

      this.yearSlider = createSlider(2000, 2025, this.currentYear, 1);
      this.yearSlider.position(350, 50);
      this.yearSlider.style('width', '100px');
      this.yearSlider.input(this.onYearChange.bind(this));

      let countries = new Set();
      for (let i = 0; i < this.data.getRowCount(); i++) {
          countries.add(this.data.getString(i, 'Country'));
      }
      this.countrySelect = createSelect();
      this.countrySelect.position(250, 50);
      this.countrySelect.style('font-size', '14px');
      this.countrySelect.option("Select Country");
      for (let country of Array.from(countries).sort()) {
          this.countrySelect.option(country);
      }
      this.countrySelect.changed(this.countrySelected.bind(this));

      this.radarChart = new RadarChart(width / 2 + 100, height / 2, 250);
      this.updateYearSliderOptions();
  };


   this.updateYearSliderOptions = function() {
    if (this.yearSlider) { // Ensure slider exists
          // Remove existing options (important to avoid duplicates)
          this.yearSlider.remove();

          //recreate the slider
          this.yearSlider = createSlider(min(this.availableYears), max(this.availableYears), this.currentYear, 1);
          this.yearSlider.position(350, 50);
          this.yearSlider.style('width', '100px');
          this.yearSlider.input(this.onYearChange.bind(this));
      }

  }


  this.countrySelected = function() {
      this.selectedCountry = this.countrySelect.value();
      // Reset animation when country changes
      this.animationProgress = 0;
      this.draw();
  };

  this.onYearChange = function() {
      this.currentYear = this.yearSlider.value();

      let countriesForYear = new Set();
      let filteredByYear = this.data.getRows().filter(row => row.getNum('Year') === this.currentYear);
      for (let row of filteredByYear) {
          countriesForYear.add(row.getString('Country'));
      }

       if (this.countrySelect){
          this.countrySelect.remove(); // Remove the old dropdown
      }
      this.countrySelect = createSelect();
      this.countrySelect.position(250, 50);
      this.countrySelect.style('font-size', '14px');
      this.countrySelect.option("Select Country");
      for (let country of Array.from(countriesForYear).sort()) {
          this.countrySelect.option(country);
      }
      this.countrySelect.changed(this.countrySelected.bind(this));
      this.selectedCountry = null;

      // Reset animation when year changes
      this.animationProgress = 0;
      this.draw();
  };


  this.destroy = function() {
      if (this.yearSlider) {
          this.yearSlider.remove();
          this.yearSlider = null;
      }
      if (this.countrySelect) {
          this.countrySelect.remove();
          this.countrySelect = null;
      }
  };

  this.draw = function() {
      if (!this.loaded || this.currentYear === null) {
          console.log('Data not yet loaded or year not set');
          return;
      }
      

      background(255);

      // --- Data Filtering and Preparation ---
      let filteredData = this.data.getRows().filter(row => row.getNum('Year') === this.currentYear);
      let radarData = [];
      let radarLabels = [];

      if (this.selectedCountry && this.selectedCountry !== "Select Country") {
          filteredData = filteredData.filter(row => row.getString('Country') === this.selectedCountry);

          let ageGroupData = new Map();
          for (let row of filteredData) {
              ageGroupData.set(row.getString('Age_Group'), row.getNum('Screen_Time_Hours'));
          }

          for (let [ageGroup, screenTime] of ageGroupData) {
              radarData.push(screenTime);
              radarLabels.push(ageGroup);
          }
           //added spacing for the text
          radarLabels = radarLabels.map((label) => label + "  ");

      } else {
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

          let aggregatedData = [];
          for (let [country, totalScreenTime] of countryData) {
              let rowCount = filteredData.filter(row => row.getString('Country') === country).length;
              aggregatedData.push({
                  country: country,
                  screenTime: totalScreenTime / rowCount,
              });
          }

          aggregatedData.sort((a, b) => b.screenTime - a.screenTime);
          aggregatedData = aggregatedData.slice(0, 6);
          aggregatedData = aggregatedData.map((data) => {
              return {country: data.country + "   ", screenTime: data.screenTime}
          });

          for (let dataPoint of aggregatedData) {
              radarData.push(dataPoint.screenTime);
              radarLabels.push(dataPoint.country);
          }
      }


      // --- Animation Logic ---
      if (radarData.length > 0) { // Only animate if we have data
          if (this.animationProgress < 1) {
              this.animationProgress += 0.02;  // Control animation speed
              this.animationProgress = min(this.animationProgress, 1); // Clamp to 1
          }

          // Apply animation progress to the data
          let animatedRadarData = radarData.map(value => value * this.animationProgress);
          this.radarChart.draw(animatedRadarData, radarLabels, this.selectedCountry ? `${this.selectedCountry} - ${this.currentYear}` : `Top 6 Countries - ${this.currentYear}`);
      }


      // --- UI and Text Display ---
      fill(0);
      noStroke();
      textSize(16);
      text(`Year: ${this.currentYear}`, this.yearSlider.x + this.yearSlider.width + 20, this.yearSlider.y + 15);

      if (this.selectedCountry && this.selectedCountry !== "Select Country") {
          fill(0);
          noStroke();
          textSize(12);
          textAlign(LEFT, TOP);
          let textX = 50;
          let textY = 120;
          let lineHeight = 18;
          text(`Screen Time Data for ${this.selectedCountry} in ${this.currentYear}:`, textX, textY);
          textY += lineHeight * 1.5;
          for (let i = 0; i < radarLabels.length; i++) {
              text(`${radarLabels[i]}: ${radarData[i].toFixed(2)} hours`, textX, textY);
              textY += lineHeight;
          }
      }

      // --- Interactive Features (Hover/Click) ---
      // (Implementation for hover/click would go here, see below)
      // Inside average-daily-screen.js, ADD to the END of the draw() method:

        // --- Interactive Features (Hover/Click) ---
        if (radarData.length > 0) { // Only if there's data
          let angleStep = TWO_PI / radarData.length;
          for (let i = 0; i < radarData.length; i++) {
              let scaledValue = map(radarData[i] * this.animationProgress, 0, this.radarChart.maxValue, 0, this.radarChart.diameter / 2);
              let px = this.radarChart.x + cos(i * angleStep - HALF_PI) * scaledValue;
              let py = this.radarChart.y + sin(i * angleStep - HALF_PI) * scaledValue;

              // Simple hover effect: Change cursor if mouse is near a point
              let distance = dist(mouseX, mouseY, px, py);
              if (distance < 10) { // 10 pixels is the "hit" radius
                  cursor('pointer'); // Change cursor to a hand

                  // Display tooltip (basic example)
                  fill(0);
                  noStroke();
                  textSize(12);
                  textAlign(CENTER, TOP);
                  text(`${radarLabels[i]}: ${radarData[i].toFixed(2)} hours`, px, py + 10); // Tooltip

                  // Click handling (basic example)
                  if (mouseIsPressed) {
                      console.log("Clicked on:", radarLabels[i]);
                      // Here, you could trigger more detailed information
                      // (e.g., show a popup, highlight the selected item, etc.)
                  }

                  return; // Exit the loop once we find a hit
              }
          }
          cursor(ARROW); // Reset cursor if not hovering over a point
      }
  };
}