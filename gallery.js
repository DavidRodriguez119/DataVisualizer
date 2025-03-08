function Gallery() {
  this.visuals = [];
  this.selectedVisual = null;
  var self = this;

  // Add a new visualisation to the navigation bar.
  this.addVisual = function(vis) {
    // Check that the visualisation has an id and name.
    if (!vis.hasOwnProperty('id') || !vis.hasOwnProperty('name')) {
      alert('Make sure your visualisation has an id and name!');
    }

    // Check for a duplicate id.
    if (this.findVisIndex(vis.id) != null) {
      alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
    }

    this.visuals.push(vis);

    // Create menu item.
    var menuItem = createElement('li', vis.name);
    menuItem.addClass('menu-item');
    menuItem.id(vis.id);

    menuItem.mouseOver(function(e) {
      var el = select('#' + e.srcElement.id);
      el.addClass("hover");
    });
    menuItem.mouseOut(function(e) {
      var el = select('#' + e.srcElement.id);
      el.removeClass("hover");
    });
    menuItem.mouseClicked(function(e) {
      // Remove the selected class from all menu items.
      var menuItems = selectAll('.menu-item');
      for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].removeClass('selected');
      }
      var el = select('#' + e.srcElement.id);
      el.addClass('selected');
      self.selectVisual(e.srcElement.id);
    });

    var visMenu = select('#visuals-menu');
    visMenu.child(menuItem);

    // Preload data/images if necessary.
    if (vis.hasOwnProperty('preload')) {
      vis.preload();
    }
  };

  this.findVisIndex = function(visId) {
    // Search through the visualisations for one with the matching id.
    for (var i = 0; i < this.visuals.length; i++) {
      if (this.visuals[i].id == visId) {
        return i;
      }
    }
    // Visualisation not found.
    return null;
  };

  this.selectVisual = function(visId) {
    var visIndex = this.findVisIndex(visId);
    if (visIndex != null) {
      // If a visualisation is already selected and it has a destroy method, run it.
      if (this.selectedVisual != null && this.selectedVisual.hasOwnProperty('destroy')) {
        this.selectedVisual.destroy();
      }
      // Select the visualisation.
      this.selectedVisual = this.visuals[visIndex];
      // Initialise the visualisation if needed.
      if (this.selectedVisual.hasOwnProperty('setup')) {
        this.selectedVisual.setup();
      }
      // Resume animation if it was paused.
      loop();
    }
  };
}
