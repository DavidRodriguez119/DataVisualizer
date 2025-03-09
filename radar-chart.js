// radar-chart.js
function RadarChart(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.maxValue = 10; // Maximum screen time.  Adjust if your data has higher values.

    this.draw = function(data, labels, title) {
        let numPoints = data.length;
        if (numPoints === 0) { // IMPORTANT: Handle empty data
            return;
        }
        let angleStep = TWO_PI / numPoints;

        // --- Background Circles ---
        stroke(200);
        noFill(); // Don't fill the background circles.
        for (let i = 1; i <= 5; i++) {
            let radius = (this.diameter / 2) * (i / 5);
            ellipse(this.x, this.y, radius * 2, radius * 2);
        }

        // --- Radar Polygon ---
        stroke(0, 102, 153);
        fill(0, 102, 153, 100);
        beginShape();
        for (let i = 0; i < numPoints; i++) {
            // Correct scaling and centering:
            let scaledValue = map(data[i], 0, this.maxValue, 0, this.diameter / 2);
            let px = this.x + cos(i * angleStep - HALF_PI) * scaledValue;
            let py = this.y + sin(i * angleStep - HALF_PI) * scaledValue;
            vertex(px, py);
            ellipse(px, py, 5, 5); // Keep the small circles at data points
        }
        endShape(CLOSE);

        // --- Labels ---
        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER); // Center the text
        for (let i = 0; i < numPoints; i++) {
            // Place labels *outside* the radar chart:
            let labelRadius = this.diameter / 2 + 20; // Space for labels.  Adjust as needed.
            let px = this.x + cos(i * angleStep - HALF_PI) * labelRadius;
            let py = this.y + sin(i * angleStep - HALF_PI) * labelRadius;

            // Calculate text width for better centering at different angles:
            let textW = textWidth(labels[i]);
            let labelX = px;
            let labelY = py;

             if (i * angleStep > PI / 2 && i * angleStep < 3 * PI / 2) {
                // Left side: Adjust for text width
                labelX -= textW / 2;
                textAlign(RIGHT, CENTER);
            }
              else if (i*angleStep == PI/2){
                labelY += textW/4;

            }
             else if (i*angleStep == (3*PI)/2){
                labelY -= textW/4;
            }

            else {
                // Right side:  No adjustment needed
                labelX += textW / 2;
                textAlign(LEFT,CENTER);
            }
           text(labels[i], labelX, labelY);

        }

        // --- Title ---
        if (title) {
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(16);
            text(title, this.x, this.y - this.diameter / 2 - 30); // Position above the chart
        }
    };
}