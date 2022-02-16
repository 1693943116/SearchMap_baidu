import { useEffect, useState } from "react";

// 初始化地图
export const useInitMap = (setLocation, lng, lat, callback) => {
  useEffect(() => {
    const map = new window.BMapGL.Map("map-container"),
      myCity = new window.BMapGL.LocalCity();
    myCity.get((res) => {
      let point;
      if (lng && lat) {
        point = new window.BMapGL.Point(lng, lat);
      } else {
        point = new window.BMapGL.Point(res.center.lng, res.center.lat);
      }

      map.centerAndZoom(point, 13);
      const marker = new window.BMapGL.Marker(point);
      map.addOverlay(marker);
      if (lng && lat) {
        setLocation([lng, lat]);
      } else {
        setLocation([res.center.lng, res.center.lat]);
      }
    });

    map.enableScrollWheelZoom(true);
    callback(map);
  }, []);
};

// 点击添加marker 并且更新经纬度
export const useClickMarker = (initMap, setLocation) => {
  useEffect(() => {
    if (initMap) {
      initMap.addEventListener("click", function (e) {
        const lng = e.latlng.lng,
          lat = e.latlng.lat,
          point = new window.BMapGL.Point(lng, lat);

        initMap.clearOverlays();

        const marker = new window.BMapGL.Marker(point);
        initMap.addOverlay(marker);
        setLocation([lng, lat]);
      });
    }
  }, [initMap]);
};
