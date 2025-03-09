function CatPopulationByCountry() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Cat Population by Country (Top 20)';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'cat-population-by-country';

    // Configuration Constants
    const CANVAS_WIDTH = 1024;
    const CANVAS_HEIGHT = 576;
    const MAP_X = 50;
    const MAP_Y = 70;
    const MAP_WIDTH = CANVAS_WIDTH - 100;
    const MAP_HEIGHT = CANVAS_HEIGHT - 120;
    const MIN_ICON_SIZE = 5;
    const MAX_ICON_SIZE = 35;
    const TOOLTIP_BG_COLOR = color(255, 255, 255, 220);
    const TOOLTIP_TEXT_COLOR = color(0);
    const HIGHLIGHT_COLOR = color(255, 0, 0, 100);
    const NUM_CAT_IMAGES = 20;
    const DROPDOWN_Y_OFFSET = 20;

    // Instance Variables
    this.catData = null;
    this.mapImage = null;
    this.catImages = [];
    this.maxCatPopulation = 0;
    this.countrySelect = null;
    this.countries = [];
    this.selectedCountry = null;
    this.hoveredCountry = null;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.catData = loadTable('data/cat_population_by_country/cat-population-by-country-top-20.csv', 'csv', 'header');
        this.mapImage = loadImage('assets/worldmap.png');

        for (let i = 0; i < NUM_CAT_IMAGES; i++) {
            this.catImages.push(loadImage(`assets/cat-${i + 1}.png`));
        }
    };

     // Setup the visualization.  This is only called once.
    this.setup = function() {
        this.processData();
        this.setupDropdown();
        loop(); // Re-enable the draw loop for continuous updates.
    };

    // Removes the country selection element and other elements created
    this.destroy = function() {
        if (this.countrySelect) {
            this.countrySelect.remove();
            this.countrySelect = null;
        }
    };

    // Load and process the data
    this.processData = function() {
        if (!this.catData) return;

        this.countries = [];
        for (let i = 0; i < this.catData.getRowCount(); i++) {
            const row = this.catData.getRow(i);
            const popString = row.get('Estimated Cat Population');
            const popNum = (popString && typeof popString === 'string') ? parseInt(popString.replace(/,/g, ''), 10) || 0 : 0;

            this.countries.push({
                country: row.getString('Country'),
                population: popNum,
                x: null,
                y: null
            });
        }

        this.maxCatPopulation = Math.max(...this.countries.map(c => c.population), 0);
        this.setManualCoordinates();
    };

    // Sets up the dropdown menu for country selection.
    this.setupDropdown = function() {
        this.countrySelect = createSelect();
        const dropdownX = MAP_X + MAP_WIDTH / 2.9 - this.countrySelect.width / 2;
        const dropdownY = DROPDOWN_Y_OFFSET;

        this.countrySelect.position(dropdownX, dropdownY);
        this.countrySelect.id('country-select');
        this.countrySelect.attribute('name', 'country');
        this.countrySelect.parent('app');
        this.countrySelect.option('Select a country');

        if (this.countries) {
            this.countries.forEach((country) => {
                this.countrySelect.option(country.country);
            });
        }

        this.countrySelect.changed(this.onCountryChange.bind(this));
    };


    //Handles changes to the country selection.
    this.onCountryChange = function() {
        this.selectedCountry = this.countrySelect.value();
        this.hoveredCountry = null;
    };

    // Main draw loop.
    this.draw = function() {
        background(220);
        this.drawTitle();
        this.drawMap();
        this.hoveredCountry = null;

        for (let i = 0; i < this.countries.length; i++) {
            const countryData = this.countries[i];
            if (countryData.x === null || countryData.y === null) continue;

            const iconSize = map(countryData.population, 0, this.maxCatPopulation, MIN_ICON_SIZE * 2, MAX_ICON_SIZE);
            this.checkHover(countryData.x, countryData.y, iconSize, countryData.country, countryData.population);

            const catImage = this.catImages[i % NUM_CAT_IMAGES];
           if (catImage) {

              let drawSize = iconSize;

              image(catImage, countryData.x - drawSize / 2, countryData.y - drawSize/2, drawSize, drawSize);
           }
        }
          this.highlightSelectedCountry();
          if (this.hoveredCountry) {
            this.drawTooltip(this.hoveredCountry);
          }

    };

    // Draws the title of the visualization.
    this.drawTitle = function() {
        fill(0);
        textSize(20);
        textAlign(CENTER, TOP);
        text(this.name, CANVAS_WIDTH / 2, 10);
    };

    // Draws the world map.
    this.drawMap = function() {
        const mapY = this.countrySelect.height + 20;
        image(this.mapImage, MAP_X, mapY, MAP_WIDTH, MAP_HEIGHT);
    };

    // Highlights the selected country.
    this.highlightSelectedCountry = function() {
    if (!this.selectedCountry || this.selectedCountry === 'Select a country') return;

    const selectedCountryData = this.countries.find(country => country.country === this.selectedCountry);
    if (!selectedCountryData || selectedCountryData.x === null || selectedCountryData.y === null) return;

    const x = selectedCountryData.x;
    const y = selectedCountryData.y;
        push();
        noFill();
        stroke(HIGHLIGHT_COLOR);
        strokeWeight(3);
        const highlightSize = MAX_ICON_SIZE + 10 + sin(frameCount * 0.1) * 5;
        ellipse(x, y, highlightSize, highlightSize);
        pop();
    };

    // Checks if the mouse is hovering over a country.
    this.checkHover = function(x, y, size, country, population) {
        if (dist(mouseX, mouseY, x, y) < size / 2) {
            this.hoveredCountry = { x, y, size, country, population };
        }
    };


     // Draws the tooltip for the hovered country.
    this.drawTooltip = function(hoverData) {

            const formattedPopulation = hoverData.population.toLocaleString();
            const tooltipText = `${hoverData.country}: ${formattedPopulation}`;
            const tooltipWidth = textWidth(tooltipText) + 10;
            const tooltipHeight = 25;
            let tooltipX = hoverData.x + hoverData.size / 2;
            let tooltipY = hoverData.y - hoverData.size / 2 - tooltipHeight;

            tooltipX = constrain(tooltipX, 5, CANVAS_WIDTH - tooltipWidth - 5);
            tooltipY = constrain(tooltipY, 5, CANVAS_HEIGHT - tooltipHeight - 5);


            fill(TOOLTIP_BG_COLOR);
            stroke(0);
            rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);

            fill(TOOLTIP_TEXT_COLOR);
            noStroke();
            textSize(12);
            textAlign(LEFT, TOP);
            text(tooltipText, tooltipX + 5, tooltipY + 5);

    };


    // Manually sets the coordinates for each country.
    this.setManualCoordinates = function() {
        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i];

            switch (country.country) {
                case 'United States':
                    country.x = 176.79;
                    country.y = 223;
                    break;
                case 'China':
                    country.x = 780.79;
                    country.y = 230;
                    break;
                case 'Russia':
                    country.x = 750;
                    country.y = 170;
                    break;
                case 'France':
                    country.x = 486.79;
                    country.y = 199;
                    break;
                case 'Germany':
                    country.x = 516.79;
                    country.y = 186;
                    break;
                case 'Brazil':
                    country.x = 306.79;
                    country.y = 344;
                    break;
                case 'United Kingdom':
                    country.x = 471.79;
                    country.y = 174;
                    break;
                case 'Italy':
                    country.x = 508.79;
                    country.y = 205;
                    break;
                case 'India':
                    country.x = 715.79;
                    country.y = 263;
                    break;
                case 'Japan':
                    country.x = 887.79;
                    country.y = 229;
                    break;
                case 'Ukraine':
                    country.x = 562.79;
                    country.y = 195;
                    break;
                case 'Canada':
                    country.x = 189.79;
                    country.y = 172;
                    break;
                case 'Mexico':
                    country.x = 164.79;
                    country.y = 257;
                    break;
                case 'Poland':
                    country.x = 533.79;
                    country.y = 185;
                    break;
                case 'Spain':
                    country.x = 468.79;
                    country.y = 219;
                    break;
                case 'Pakistan':
                    country.x = 683.79;
                    country.y = 248;
                    break;
                case 'Bangladesh':
                    country.x = 736.79;
                    country.y = 250;
                    break;
                case 'Australia':
                    country.x = 882.79;
                    country.y = 394;
                    break;
                case 'Argentina':
                    country.x = 284.79;
                    country.y = 425;
                    break;
                case 'Netherlands':
                    country.x = 495.79;
                    country.y = 186;
                    break;

                default:
                    console.warn(`Coordinates not set for ${country.country}`);
            }
        }
    };
}