function PayGapByJob2017() {
    this.name = 'Pay gap by job: 2017';
    this.id = 'pay-gap-by-job-2017';
    this.loaded = false;
    this.pad = 110;
    this.dotSizeMin = 15;
    this.dotSizeMax = 40;
    this.points = [];
  
    // Load dataset
    this.preload = function() {
      var self = this;
      this.data = loadTable(
        './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv',
        'csv',
        'header',
        function() { self.loaded = true; }
      );
    };
  
    this.setup = function() { this.padTopOffset = 40; };
  
    // ----------------------------------------
    // DESTROY (CLEANUP WHEN SWITCHING VISUALS) - Enhanced Reset for PayGapByJob2017
    // ----------------------------------------
    this.destroy = function () {
      console.log("PayGapByJob2017 destroy() called - Enhanced Reset");
  
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
    };
  
    this.draw = function() {
      if (!this.loaded) return console.log('Data not yet loaded');
  
      var jobs = this.data.getColumn('job_subtype');
      var propFemale = stringsToNumbers(this.data.getColumn('proportion_female'));
      var payGap = stringsToNumbers(this.data.getColumn('pay_gap'));
      var numJobs = stringsToNumbers(this.data.getColumn('num_jobs'));
  
      background(255);
      this.addAxes();
      this.points = [];
  
      // Draw circles representing job pay gaps
      for (var i = 0; i < this.data.getRowCount(); i++) {
        let x = map(propFemale[i], 0, 100, this.pad, width - this.pad);
        let y = map(payGap[i], -20, 20, height - this.pad, this.pad) + this.padTopOffset;
        let r = map(numJobs[i], min(numJobs), max(numJobs), this.dotSizeMin, this.dotSizeMax);
        
        // Set color based on pay gap
        let circleColor = payGap[i] > 0.5 ? color(255, 80, 80) : payGap[i] < -0.5 ? color(80, 255, 80) : color(180);
        fill(circleColor);
        stroke(0);
        ellipse(x, y, r, r);
  
        this.points.push({ x, y, r: r / 2, job: jobs[i], propFemale: propFemale[i], payGap: payGap[i], numJobs: numJobs[i] });
      }
  
      this.drawLegendTopRight();
      this.drawTitle();
      this.checkHover();
    };
  
    // Draw central axes
    this.addAxes = function() {
      stroke(200);
      line(width / 2, this.pad + this.padTopOffset, width / 2, height - this.pad);
      line(this.pad, (height / 2) + this.padTopOffset, width - this.pad, (height / 2) + this.padTopOffset);
    };
  
    // Legend for pay gap colors
    this.drawLegendTopRight = function() {
      let legendX = width - 140, legendY = 60;
      noStroke(); textSize(14); fill(0);
      textAlign(LEFT, TOP); text("Legend:", legendX, legendY);
      legendY += 25;
      
      let colors = [[255, 80, 80, "Men earn more"], [80, 255, 80, "Women earn more"], [180, 180, 180, "Near equal pay"]];
      for (let [r, g, b, label] of colors) {
        fill(r, g, b); ellipse(legendX, legendY, 12, 12);
        fill(0); text(label, legendX + 20, legendY - 6);
        legendY += 25;
      }
    };
  
    this.drawTitle = function() {
      fill(0); noStroke(); textSize(20);
      textAlign(CENTER, TOP); text(this.name, width / 2, 10);
    };
  
    // Tooltip for hovering over circles
    this.checkHover = function() {
      let hovered = false;
      for (let pt of this.points) {
        if (dist(mouseX, mouseY, pt.x, pt.y) < pt.r) {
          cursor('pointer');
          this.drawTooltip(pt);
          hovered = true;
          break;
        }
      }
      if (!hovered) cursor(ARROW);
    };
  
    // Tooltip display
    this.drawTooltip = function(pt) {
      let tooltipStr = `${pt.job}\nFemale: ${pt.propFemale}%\nPay Gap: ${pt.payGap}%\nJobs: ${pt.numJobs}`;
      textSize(12);
      let tw = max(100, textWidth(pt.job) + 20), th = 60;
      let tooltipX = pt.x, tooltipY = pt.y - pt.r - 10 - th / 2;
      
      fill(255, 220); noStroke(); rectMode(CENTER);
      rect(tooltipX, tooltipY, tw, th, 5);
      
      fill(0); textAlign(CENTER, TOP);
      tooltipStr.split('\n').forEach((line, i) => text(line, tooltipX, tooltipY - (th / 2) + 8 + i * 14));
    };
  }

