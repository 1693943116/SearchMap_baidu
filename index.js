import { Modal, Select, Spin } from "antd";
import { useState, useCallback } from "react";
import { useInitMap, useClickMarker } from "./useInitMap";

let searchCha, timeout, myGeo;
const { Option } = Select;

export default function SelfMap({ visible, lng, lat, render }) {
  const [location, setLocation] = useState([]);
  const [initMap, setInitMap] = useState();
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
  // 初始化地图
  useInitMap(setLocation, lng, lat, (map) => {
    setInitMap(map);
    searchCha = new window.BMapGL.LocalSearch(map, {});
    myGeo = new window.BMapGL.Geocoder();
  });
  // 点击添加marker 并且更新经纬度
  useClickMarker(initMap, setLocation);

  // 搜索
  const search = useCallback((e) => {
    if (timeout) clearTimeout(timeout);
    setFetching(true);
    timeout = setTimeout(() => {
      searchCha.search(e);
      searchCha.setSearchCompleteCallback((res) => {
        setOptions([]);
        if (res?._pois?.length > 0) {
          const result = res._pois;
          const resultOpactions = result.map((item, index) => {
            return (
              <Option
                key={index}
                value={`${item?.point?.lng},${item?.point?.lat}`}
              >
                {item.title}
              </Option>
            );
          });

          setOptions(resultOpactions);
        }
        setFetching(false);
      });
    }, 300);
  }, []);
  // 搜索的结果
  const change = useCallback(
    (e) => {
      const arr = e.split(",");
      if (initMap) {
        const point = new window.BMapGL.Point(arr[0], arr[1]);
        initMap.clearOverlays();
        const marker = new window.BMapGL.Marker(point);
        initMap.addOverlay(marker);
        initMap.setViewport([point]);
        setLocation(arr);
      }
    },
    [initMap]
  );
  // 提交
  const submit = () => {
    myGeo.getLocation(
      new window.BMapGL.Point(location[0], location[1]),
      function (result) {
        if (result) {
          render(result);
        }
      }
    );
  };
  return (
    <>
      <Modal
        title="地图组件"
        visible={visible}
        width={800}
        onOk={() => {
          submit(1);
        }}
        onCancel={() => {
          submit(0);
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "90px",
            right: "40px",
            width: "300px",
            zIndex: 10,
          }}
        >
          <Select
            style={{ width: "100%" }}
            filterOption={false}
            showSearch
            onSearch={search}
            onChange={change}
            notFoundContent={fetching ? <Spin size="small" /> : null}
          >
            {options.length > 0 ? options : []}
          </Select>
        </div>
        <div
          id="map-container"
          style={{ width: "750px", height: "600px" }}
        ></div>
      </Modal>
    </>
  );
}
