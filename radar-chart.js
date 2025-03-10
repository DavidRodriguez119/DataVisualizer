function RadarChart(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.maxValue = 10; // Maximum screen time
  
    this.draw = function(data, labels, title) {
      let numPoints = data.length;
      if (numPoints === 0) return;
  
      let angleStep = TWO_PI / numPoints;
  
      // 1) Draw concentric circles
      stroke(180);
      strokeWeight(1);
      noFill();
      for (let i = 1; i <= 5; i++) {
        let radius = (this.diameter / 2) * (i / 5);
        ellipse(this.x, this.y, radius * 2, radius * 2);
      }
  
      // 2) Draw the radar polygon with a translucent fill and thicker outline
      stroke(0, 102, 153, 200);
      strokeWeight(2);
      fill(0, 102, 153, 80); // Slightly translucent fill
      beginShape();
      for (let i = 0; i < numPoints; i++) {
        let scaledValue = map(data[i], 0, this.maxValue, 0, this.diameter / 2);
        let px = this.x + cos(i * angleStep - HALF_PI) * scaledValue;
        let py = this.y + sin(i * angleStep - HALF_PI) * scaledValue;
        vertex(px, py);
        // Optionally draw a small circle at each vertex
        ellipse(px, py, 5, 5);
      }
      endShape(CLOSE);
  
      // 3) Draw axis labels around the radar
      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
  
      for (let i = 0; i < numPoints; i++) {
        let labelRadius = this.diameter / 2 + 20;
        let px = this.x + cos(i * angleStep - HALF_PI) * labelRadius;
        let py = this.y + sin(i * angleStep - HALF_PI) * labelRadius;
  
        // Basic logic to position text left/right depending on angle
        let textW = textWidth(labels[i]);
        let labelX = px;
        let labelY = py;
  
        // This is a simple approach; you can refine for better label alignment
        if (i * angleStep > PI / 2 && i * angleStep < (3 * PI) / 2) {
          textAlign(RIGHT, CENTER);
        } else {
          textAlign(LEFT, CENTER);
        }
        text(labels[i], labelX, labelY);
      }
  
      // 4) Optionally draw a chart title above the radar (unused if we pass "")
      if (title) {
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);
        text(title, this.x, this.y - this.diameter / 2 - 30);
      }
    };
  }
  