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

    // 3) Draw axis labels around the radar with quadrant-based alignment
    fill(0);
    noStroke();
    textSize(12);

    // Extend the label radius slightly so text doesn't overlap the shape
    let labelRadius = this.diameter / 2 + 25;

    for (let i = 0; i < numPoints; i++) {
      // Compute angle for the current label
      let labelAngle = (i * angleStep) - HALF_PI; // Start from top (-90°)
      
      // Compute label position
      let px = this.x + cos(labelAngle) * labelRadius;
      let py = this.y + sin(labelAngle) * labelRadius;

      // Normalize angle to [0..360) for easier quadrant checks
      let angleDeg = degrees((labelAngle + TWO_PI) % TWO_PI);

      // Quadrant-based text alignment
      // Feel free to tweak angle boundaries if desired
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

    // 4) Optionally draw a chart title above the radar (unused if we pass "")
    if (title) {
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(title, this.x, this.y - this.diameter / 2 - 30);
    }
  };
}
