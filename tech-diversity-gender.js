function TechDiversityGender() {

    // VISUALISATION NAME
    this.name = 'Tech Diversity: Gender';
  
    // UNIQUE ID FOR VISUALISATION
    this.id = 'tech-diversity-gender';
  
    // LAYOUT OBJECT TO STORE COMMON PLOT LAYOUT PARAMETERS
    this.layout = {
      // MARGIN LOCATIONS (LEFT AND BOTTOM HAVE DOUBLE MARGIN SIZE FOR AXIS LABELS)
      leftMargin: 130,
      rightMargin: width,
      topMargin: 30,
      bottomMargin: height,
      pad: 5,
  
      // FUNCTION TO CALCULATE PLOT WIDTH
      plotWidth: function() {
        return this.rightMargin - this.leftMargin;
      },
  
      // BOOLEAN TO ENABLE/DISABLE BACKGROUND GRID (NOT USED IN THIS VISUALISATION)
      grid: false,
  
      // NUMBER OF X-AXIS TICK LABELS (NOT USED IN THIS VISUALISATION)
      numXTickLabels: 0,
      // NUMBER OF Y-AXIS TICK LABELS (NOT USED IN THIS VISUALISATION)
      numYTickLabels: 0,
    };
  
    // X-POSITION FOR 50% LINE
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  
    // COLOURS FOR FEMALE AND MALE BARS
    this.femaleColour = color(255, 0 ,0); // Red for female
    this.maleColour = color(0, 0, 255);   // Blue for male (changed from green for better contrast)
  
    // DATA LOADING FLAG
    this.loaded = false;
  
      // VARIABLE TO STORE HOVERED COMPANY INDEX
      this.hoveredCompanyIndex = null;
  
      // VARIABLE TO CONTROL ANIMATION PROGRESS (0 to 1)
      this.animationProgress = 0;
  
  
    // PRELOAD DATA FROM CSV FILE
    this.preload = function() {
      var self = this;
      this.data = loadTable(
        './data/tech-diversity/gender-2018.csv', 'csv', 'header',
        function(table) {
          self.loaded = true;
        });
    };
  
    // SETUP FUNCTION (CALLED ONCE WHEN VISUALISATION IS SELECTED)
    this.setup = function() {
      // FONT DEFAULTS
      textSize(16);
    };
  
      // ----------------------------------------
      // DESTROY (CLEANUP WHEN SWITCHING VISUALS) - Enhanced Reset
      // ----------------------------------------
      this.destroy = function () {
        console.log("TechDiversityGender destroy() called - Enhanced Reset");
  
        // Reset p5.js drawing states
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
  
        // Reset hover state
        this.hoveredCompanyIndex = null;
        this.animationProgress = 0; // Reset animation on destroy too
      };
  
  
    // DRAW FUNCTION (MAIN RENDERING LOOP)
    this.draw = function() {
      if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }
  
      background(255); // Set background to white for clarity
  
  
      // DRAW FEMALE/MALE LABELS AT THE TOP
      this.drawCategoryLabels();
  
      var lineHeight = (height - this.layout.topMargin) /
          this.data.getRowCount();
  
      // RESET HOVERED COMPANY INDEX AT THE START OF EACH DRAW
      this.hoveredCompanyIndex = null;
  
      // UPDATE ANIMATION PROGRESS
      if (this.animationProgress < 1) {
        this.animationProgress += 0.02; // Adjust animation speed as needed
        this.animationProgress = min(this.animationProgress, 1); // Clamp to max 1
      }
  
  
      for (var i = 0; i < this.data.getRowCount(); i++) {
        // Y POSITION FOR EACH COMPANY'S ROW
        var lineY = (lineHeight * i) + this.layout.topMargin;
  
        // OBJECT TO HOLD COMPANY DATA FOR THE CURRENT ROW
        var company = {
          'name': this.data.getString(i, 'company'),
          'female': this.data.getNum(i, 'female'),
          'male': this.data.getNum(i, 'male'),
        };
  
        // DRAW COMPANY NAME IN THE LEFT MARGIN
        fill(0);
        noStroke();
        textAlign('right', 'top');
        text(company.name,
             this.layout.leftMargin - this.layout.pad,
             lineY);
  
        // CALCULATE WIDTH FOR FEMALE AND MALE BARS (ANIMATED)
        var femaleWidth = this.mapPercentToWidth(company.female, this.animationProgress);
        var maleWidth = this.mapPercentToWidth(company.male, this.animationProgress);
  
  
        // DRAW FEMALE EMPLOYEES RECTANGLE
        fill(this.femaleColour);
        strokeWeight(this.hoveredCompanyIndex === i ? 2 : 0); // Highlight on hover
        stroke(0); // Highlight color
        rect(this.layout.leftMargin,
             lineY,
             femaleWidth,
             lineHeight - this.layout.pad);
  
        // DRAW MALE EMPLOYEES RECTANGLE
        fill(this.maleColour);
        strokeWeight(this.hoveredCompanyIndex === i ? 2 : 0); // Highlight on hover
        stroke(0); // Highlight color
        rect(this.layout.leftMargin + femaleWidth,
             lineY,
             maleWidth,
             lineHeight - this.layout.pad);
  
  
        // DISPLAY PERCENTAGE LABELS ON BARS (VALUE LABELS)
        fill(255); // White text for labels - adjust as needed for bar color
        noStroke();
        textAlign('left', 'center'); // Align text inside bars
  
        // Position for female percentage label (inside female bar, adjust x position as needed)
        var femaleLabelX = this.layout.leftMargin + 5; // 5px padding from bar start
        var labelYCenter = lineY + (lineHeight - this.layout.pad) / 2; // Vertical center of the bar
  
        if (femaleWidth > 15) { // Only show label if bar is wide enough
          text(company.female + '%', femaleLabelX, labelYCenter);
        }
  
  
        // Position for male percentage label (after female bar)
        var maleLabelX = this.layout.leftMargin + femaleWidth + 5; // Start after female bar + 5px padding
        if (maleWidth > 15) { // Only show label if bar is wide enough
          text(company.male + '%', maleLabelX, labelYCenter);
        }
  
  
        // -- HOVER DETECTION --
        // Combine female and male rect bounds for hover area
        var barStartX = this.layout.leftMargin;
        var barEndX = this.layout.leftMargin + femaleWidth + maleWidth;
        var barTopY = lineY;
        var barBottomY = lineY + lineHeight - this.layout.pad;
  
  
        if (mouseX > barStartX && mouseX < barEndX && mouseY > barTopY && mouseY < barBottomY) {
          this.hoveredCompanyIndex = i;
          cursor('pointer'); // Change cursor to pointer on hover
        }
      } // End for loop iterating over companies
  
      // DRAW 50% LINE
      stroke(150);
      strokeWeight(1);
      line(this.midX,
           this.layout.topMargin,
           this.midX,
           this.layout.bottomMargin);
  
  
      // --- DRAW TOOLTIP IF COMPANY IS HOVERED ---
      if (this.hoveredCompanyIndex !== null) {
        this.drawTooltip(this.data.getRow(this.hoveredCompanyIndex));
      } else {
        cursor(ARROW); // Revert cursor to default if not hovering
      }
  
  
    }; // End of draw function
  
  
    // DRAW CATEGORY LABELS (FEMALE, 50%, MALE) AT THE TOP
    this.drawCategoryLabels = function() {
      fill(0);
      noStroke();
      textAlign('left', 'top');
      text('Female',
           this.layout.leftMargin,
           this.layout.pad);
      textAlign('center', 'top');
      text('50%',
           this.midX,
           this.layout.pad);
      textAlign('right', 'top');
      text('Male',
           this.layout.rightMargin,
           this.layout.pad);
    };
  
  
    // MAP PERCENTAGE TO BAR WIDTH (ANIMATED)
    this.mapPercentToWidth = function(percent, animationProgress) {
      return map(percent,
                 0,
                 100,
                 0,
                 this.layout.plotWidth()) * animationProgress; // Apply animation progress here
    };
  
  
    // DRAW TOOLTIP FUNCTION
    this.drawTooltip = function(companyRow) {
      let companyName = companyRow.getString('company');
      let femalePercent = companyRow.getNum('female');
      let malePercent = companyRow.getNum('male');
  
      let tooltipText = `${companyName}\nFemale: ${femalePercent}%\nMale: ${malePercent}%`;
      let tooltipW = max(150, textWidth(tooltipText) + 20); // wider tooltip
      let tooltipH = 60;
      let tooltipX = mouseX;
      let tooltipY = mouseY - tooltipH - 10; // Position above the mouse
  
      // Keep tooltip within canvas bounds
      tooltipX = constrain(tooltipX, 0, width - tooltipW);
      tooltipY = constrain(tooltipY, 0, height - tooltipH);
  
  
      fill(255, 240, 200); // Pale yellow tooltip background
      stroke(120);         // Light gray border
      strokeWeight(1);
      rectMode(CORNER);
      rect(tooltipX, tooltipY, tooltipW, tooltipH, 5); // Rounded corners
  
      fill(0);
      noStroke();
      textAlign(LEFT, TOP);
      textSize(14);
      text(tooltipText, tooltipX + 10, tooltipY + 10); // Text inside tooltip, with padding
    };
  }