var THREE = require('three');
var JQUERY = require('jquery');

var FloorItem = require('../items/floor_item');
var InWallFloorItem = require('../items/in_wall_floor_item');
var InWallItem = require('../items/in_wall_item');
var Item = require('../items/item');
var OnFloorItem = require('../items/on_floor_item');
var WallFloorItem = require('../items/wall_floor_item');
var WallItem = require('../items/wall_item');

var utils = require('../utils/utils');

// Import LegacyJSONLoader from the Three.js examples
require('three/examples/js/loaders/deprecated/LegacyJSONLoader');

// Accessing the LegacyJSONLoader from the global THREE object
var LegacyJSONLoader = THREE.LegacyJSONLoader;
if (!LegacyJSONLoader) {
  console.error('LegacyJSONLoader is not available in the current Three.js setup.');
} else {
  console.log('LegacyJSONLoader is successfully loaded:', LegacyJSONLoader);
}


var Scene = function(model, textureDir) {
  var scope = this;
  var model = model;
  var textureDir = textureDir;

  console.log(textureDir,": textureDir");
  

  var scene = new THREE.Scene();
  var items = [];

  this.needsUpdate = false;

  // Initialize item loader using LegacyJSONLoader
  var loader = new LegacyJSONLoader();
  // var loader = new THREE.JSONLoader();
  loader.crossOrigin = "";

  var item_types = {
    1: FloorItem,
    2: WallItem,
    3: InWallItem,
    7: InWallFloorItem,
    8: OnFloorItem,
    9: WallFloorItem
  };

  // Initialize callbacks
  this.itemLoadingCallbacks = JQUERY.Callbacks(); 
  this.itemLoadedCallbacks = JQUERY.Callbacks(); // Item
  this.itemRemovedCallbacks = JQUERY.Callbacks(); // Item

  this.add = function(mesh) {
    // Only use this for non-items
    scene.add(mesh);
  };

  this.remove = function(mesh) {
    // Only use this for non-items
    scene.remove(mesh);
    utils.removeValue(items, mesh);
  };

  this.getScene = function() {
    return scene;
  };

  this.getItems = function() {
    return items;
  };

  this.itemCount = function() {
    return items.length;
  };

  this.clearItems = function() {
    var items_copy = items.slice(); // Avoid mutating the original array
    utils.forEach(items_copy, function(item) {
      scope.removeItem(item, true);
    });
    items = [];
  };

  this.removeItem = function(item, dontRemove) {
    dontRemove = dontRemove || false;
    // Use this for item meshes
    this.itemRemovedCallbacks.fire(item);
    item.removed();
    scene.remove(item);
    if (!dontRemove) {
      utils.removeValue(items, item);
    }
  };

  this.addItem = function(itemType, fileName, metadata, position, rotation, scale, fixed) {

    console.log(fileName,": fileName ");
    
    itemType = itemType || 1;

    var loaderCallback = function(geometry, materials) {
      var item = new item_types[itemType](
        model,
        metadata, 
        geometry,
        new THREE.MeshFaceMaterial(materials),
        position, 
        rotation, 
        scale
      );
      item.fixed = fixed || false;
      items.push(item);
      scope.add(item);
      item.initObject();
      scope.itemLoadedCallbacks.fire(item);
    };

    scope.itemLoadingCallbacks.fire();
    loader.load(
      fileName,
      loaderCallback,
      textureDir
    );
  };
};

module.exports = Scene;
