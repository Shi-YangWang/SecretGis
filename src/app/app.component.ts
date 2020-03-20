import {Component, OnInit} from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import * as control from 'ol/control';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';

import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import ImageLayer from 'ol/layer/Image';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Polygon from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import Style from 'ol/style/Style';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'secret-gis';

  private map;
  private layer;

  private cloSource;
  private cloLayer;

  ngOnInit(): void {
    let cloverContainer = document.getElementById('popup');
    let cloverContent = document.getElementById('popup-content');
    let cloverOverlay = new Overlay(({
      element: cloverContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));
    // 1. Add Tile Layer.
    let openStreetMapLayer = new TileLayer({
      //使用XYZ的方式加载瓦片图
      source: new XYZ({
        //OpenStreetMap的瓦片URL
        url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    });
    this.map = new Map({
      layers: [openStreetMapLayer],
      view: new View({
        center: [0, 0],
        projection: 'EPSG:4326',
        zoom: 2
      }),
      target: 'map'
    });
    // Reflect.set(window, 'map', this.map);

    // 2. Add Vector Layer.
    let feature = new Feature({
      geometry: new Point([0, 0]),
      name: 'Center'
    });
    let source = new VectorSource({
      wrapX: false
    });
    source.addFeature(feature);
    let vector = new VectorLayer({
      source: source
    });
    this.map.addLayer(vector);

    this.cloSource = new VectorSource({
      wrapX: false
    });
    this.cloLayer = new VectorLayer({
      source: this.cloSource
    });
    this.map.addLayer(this.cloLayer);

    this.map.on('postrender', () => {
      this.cloSource.clear();
      for (let i = 0; i < 1; i++) {
        this.drawSector();
      }
    });


  }


  // radius and the number of sample points will affect render efficiency.
  drawSector() {
    let center = [800, 400];
    let radius = 50;
    let points = [];
    let angleStart = 300;
    let angleDelta = 60;
    for (let i = 0; i <= 10; i++) {
      let angle = angleStart + angleDelta * i / 10;
      let x = center[0] + radius * Math.cos(angle / 180 * Math.PI);
      let y = center[1] + radius * Math.sin(angle / 180 * Math.PI);
      let pixel = [x, y];
      points.push(this.map.getCoordinateFromPixel(pixel));
    }
    points.push(this.map.getCoordinateFromPixel(center));

    let sectorLinearRing = new LinearRing(points, 'XY');
    debugger
    let sectorPolygon = new Polygon([], 'XY');
    sectorPolygon.appendLinearRing(sectorLinearRing);
    let sectorFeature = new Feature({
      geometry: sectorPolygon
    });
    sectorFeature.setStyle(new Style({
      fill: new Fill({
        color: '#ffff00'
      }),
      stroke: new Stroke({
        color: '#0000ff'
      })
    }));
    this.cloSource.addFeature(sectorFeature);
  }
}
