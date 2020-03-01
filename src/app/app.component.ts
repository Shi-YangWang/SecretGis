import {Component, OnInit} from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import * as control from 'ol/control';
import { Logo, TileSuperMapRest, SuperMap } from '@supermap/iclient-ol';
import * as services from '@supermap/iclient-ol/services';

import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';

import * as overlay from "@supermap/iclient-ol/overlay";
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import ImageLayer from 'ol/layer/Image';
import Overlay from 'ol/Overlay';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'secret-gis';

  private map;
  private layer;

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
    const url = "https://iserver.supermap.io/iserver/services/map-world/rest/maps/World";
    this.map = new Map({
      target: 'map',
      controls: control.defaults({attributionOptions: {collapsed: false}}).extend([new Logo()]),
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: 'EPSG:4326'
      }),
      overlays: [cloverOverlay],
    });
    this.layer = new TileLayer({
      source: new TileSuperMapRest({
        url: url,
        wrapX: true
      }),
      projection: 'EPSG:4326'
    });
    this.map.addLayer(this.layer);
    Reflect.set(window, 'map', this.map);

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

    // 3. Object Query.
    let draw = new Draw({
      source: source,
      type: "Polygon",
      snapTolerance: 20
    });
    // this.map.addInteraction(draw);
    draw.on('drawend', function (e) {
      let polygon = e.feature.getGeometry();
      console.log(polygon);
      let geometryParam = new SuperMap.GetFeaturesByGeometryParameters({
        datasetNames: ["test:Sector_Site_Import_Template_P"],
        geometry: polygon,
        spatialQueryMode: "CONTAIN",
        toIndex: 100
      });
      new services.FeatureService("http://175.154.161.62:8090/iserver/services/data-test/rest/data").getFeaturesByGeometry(geometryParam, function (serviceResult) {
        console.log(serviceResult.result.features);
        let length = serviceResult.result.features.features.length;
        //Determine whether the query is successful
        if (length > 0) {
          //Query succeeded
          for (let i = 0; i < length; i++) {
            let feature = serviceResult.result.features.features[i];
            let coordinates = feature.geometry.coordinates;
            console.log(coordinates);
          }
        } else {
          //Query failed
        }
        let resultSource = new VectorSource({
          features: (new GeoJSON()).readFeatures(serviceResult.result.features),
          wrapX: false
        });
        let resultLayer = new VectorLayer({
          source: resultSource,
        });
        this.map = Reflect.get(window, 'map');
        console.log(this.map);
        this.map.addLayer(resultLayer);
      });
    });

    // 4. Draw Cells as Clovers.
    let coordinates = [10, 10];
    let graphic1 = new overlay.OverlayGraphic(
      new Point(coordinates)
    );
    let clover1 = new overlay.CloverShape({
      radius: 18,
      angle: 60,
      count: 1,
      rotation: (90 / 180) * Math.PI, //旋转角度  （读取属性获取）
      stroke: new Stroke({
        color: "rgba(0,166,0,1)",
      }),
      fill: new Fill({
        color: "rgba(0,200,0,0.6)",
      }),
    });
    graphic1.setStyle(clover1);
    let graphic2 = new overlay.OverlayGraphic(
      new Point(coordinates)
    );
    let clover2 = new overlay.CloverShape({
      radius: 18,
      angle: 60,
      count: 1,
      rotation: (-150 / 180) * Math.PI, //旋转角度  （读取属性获取）
      stroke: new Stroke({
        color: "rgba(0,166,0,1)",
      }),
      fill: new Fill({
        color: "rgba(0,200,0,0.6)",
      }),
    });
    graphic2.setStyle(clover2);
    let graphic3 = new overlay.OverlayGraphic(
      new Point(coordinates)
    );
    let clover3 = new overlay.CloverShape({
      radius: 18,
      angle: 60,
      count: 1,
      rotation: (-30 / 180) * Math.PI, //旋转角度  （读取属性获取）
      stroke: new Stroke({
        color: "rgba(0,166,0,1)",
      }),
      fill: new Fill({
        color: "rgba(0,200,0,0.6)",
      }),
    });
    graphic3.setStyle(clover3);
    let graphics = [
      graphic1,
      graphic2,
      graphic3
    ];
    let cloverSource = new overlay.Graphic({
      graphics: graphics,
      render: "canvas",
      map: this.map,
      onClick: function (graphic, e) {
        /*
        for (let mGraphic of graphics) {
          let mStyle = mGraphic.getStyle();
          Reflect.set(mStyle, 'stroke', new Stroke({
            color: "rgba(0,166,0,1)",
          }));
          mGraphic.setStyle(mStyle);
        }*/
        if (graphic) {
          let coords = graphic.getGeometry().getCoordinates();
          //点击的同时修改扇瓣的颜色
          let clover = new overlay.CloverShape({
            radius: graphic.getStyle().radius_, // 半径 （读取属性获取）
            angle: graphic.getStyle().angle_, // 扇瓣宽度  （读取属性获取）
            rotation: graphic.getStyle().rotation_, //旋转角度  （读取属性获取）
            count: graphic.getStyle().count_, //数量
            stroke: graphic.getStyle().stroke,
            fill: graphic.getStyle().fill,
          });
          graphic.setStyle(clover);
          cloverContent.innerHTML = "扇瓣的坐标为：" + "[" + coords[0] + "," + coords[1] + "]" + "<br/>" + "扇瓣的半径:" +
            graphic.getStyle().radius_ + ";扇瓣的旋转角度:" + graphic.getStyle().angle_ + ";扇瓣的个数:" + graphic.getStyle().count_ +
            ";扇瓣的边框颜色:" + graphic.getStyle().stroke_.color_ +
            ";扇瓣的填充颜色:" + graphic.getStyle().fill_.color_;
          cloverOverlay.setPosition(coords);
        } else {
          cloverOverlay.setPosition(undefined);
        }
      }
    });

    let cloverLayer = new ImageLayer({
      source: cloverSource
    });
    this.map.addLayer(cloverLayer);

    // 5. Heat Map
    var geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "feature",
          "geometry": {
            "type": "Point",  //只支持point类型
            "coordinates": [20, 20]
          },
          "properties": {
            "height": Math.random()*9,
          }
        }
      ]
    };
    let heatMapSource = new overlay.HeatMap("heatMap",{"map": this.map});
    heatMapSource.addFeatures(geojson);
    this.map.addLayer(new ImageLayer({
      source: heatMapSource
    }));

    // 6. Districts
    // TODO: 行政区划，分级展示方案
  }
}
