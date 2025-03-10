//
// RadarChart.js
// --------------
// This class handles drawing a radar chart at a specified (x, y)
// with a given diameter and maximum value (maxValue).
// The draw() method expects 'data' (numerical values), 'labels' (text),
// and an optional 'title' to display above the chart.
//
function RadarChart(x, y, diameter) {
  // (x, y) center coordinates of the radar chart.
  this.x = x;
  this.y = y;

  // The overall diameter of the radar chart.
  this.diameter = diameter;

  // Maximum screen time value for scaling the data.
  this.maxValue = 10;

  // Main method to draw the radar chart with the provided data.
  this.draw = function(data, labels, title) {
    let numPoints = data.length;
    if (numPoints === 0) return; // Exit if no data

    // Calculate the angle between points (360° / numPoints).
    let angleStep = TWO_PI / numPoints;

    // 1) Draw concentric circles for reference
    stroke(180);
    strokeWeight(1);
    noFill();
    for (let i = 1; i <= 5; i++) {
      let radius = (this.diameter / 2) * (i / 5);
      ellipse(this.x, this.y, radius * 2, radius * 2);
    }

    // 2) Draw the radar polygon itself
    //    We use a translucent fill, thicker outline, and small circles at each vertex.
    stroke(0, 102, 153, 200);
    strokeWeight(2);
    fill(0, 102, 153, 80); 
    beginShape();
    for (let i = 0; i < numPoints; i++) {
      let scaledValue = map(data[i], 0, this.maxValue, 0, this.diameter / 2);
      let px = this.x + cos(i * angleStep - HALF_PI) * scaledValue;
      let py = this.y + sin(i * angleStep - HALF_PI) * scaledValue;
      vertex(px, py);
      ellipse(px, py, 5, 5);
    }
    endShape(CLOSE);

    // 3) Draw axis labels (countries, age groups, etc.) around the circle
    fill(0);
    noStroke();
    textSize(12);

    // We'll offset the label radius so it doesn't overlap the shape
    let labelRadius = this.diameter / 2 + 25;

    for (let i = 0; i < numPoints; i++) {
      let labelAngle = (i * angleStep) - HALF_PI; 
      let px = this.x + cos(labelAngle) * labelRadius;
      let py = this.y + sin(labelAngle) * labelRadius;

      // Convert the angle to degrees for quadrant-based alignment
      let angleDeg = degrees((labelAngle + TWO_PI) % TWO_PI);

      // Quadrant-based alignment for better readability
      if (angleDeg >= 45 && angleDeg < 135) {
        // Top region
        textAlign(CENTER, BOTTOM);
      } else if (angleDeg >= 135 && angleDeg < 225) {
        // Left region
        textAlign(RIGHT, CENTER);
      } else if (angleDeg >= 225 && angleDeg < 315) {
        // Bottom region
        textAlign(CENTER, TOP);
      } else {
        // Right region
        textAlign(LEFT, CENTER);
      }

      text(labels[i], px, py);
    }

    // 4) Draw a title above the radar
    if (title) {
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(title, this.x, this.y - this.diameter / 2 - 30);
    }
  };
}