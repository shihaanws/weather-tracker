import { AutoComplete, Button, Card, Empty, Select } from "antd";
import React from "react";
import { useEffect, useState } from "react";

import {
  CloudOutlined,
  DeleteTwoTone,
  FireOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Collapse, Table, Typography } from "antd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./App.css";
const { Text, Title } = Typography;

function MainContent() {
  const [columns, setColumns] = useState([]);
  const [datasource, setDatasource] = useState([]);
  const [openPanelIndex, setOpenPanelIndex] = useState(null);
  const [currentTempUnit, setCurrentTempUnit] = useState("Celcius");
  const [currentWindUnit, setCurrentWindUnit] = useState("km/h");
  const [suggestions, setSuggestions] = useState([]);

  const [addedCities, setAddedCities] = useState(() => {
    const cachedCities = localStorage.getItem("addedCities");
    return cachedCities ? JSON.parse(cachedCities) : [];
  });

  const parameterDatasource = [
    {
      key: "1",
      name: <strong>Sunrise</strong>,
    },
    {
      key: "2",
      name: <strong>Sunset</strong>,
    },
    {
      key: "3",
      name: <strong>Max Temp</strong>,
    },
    {
      key: "4",
      name: <strong>Min Temp</strong>,
    },
    {
      key: "5",
      name: <strong>Rainfall</strong>,
    },
  ];

  const parameterColumns = [
    {
      title: <div className="text-amber-600">Parameters/Dates</div>,
      dataIndex: "name",
      key: "name",
    },
  ];

  const windOptions = [
    {
      label: "km/h",
      value: "km/h",
    },
    {
      label: "miles/h",
      value: "miles/h",
    },
  ];

  const tempOptions = [
    {
      label: "Celcius",
      value: "Celcius",
    },
    {
      label: "Fahrenheit",
      value: "Fahrenheit",
    },
  ];

  // Update local storage whenever addedCities changes
  useEffect(() => {
    localStorage.setItem("addedCities", JSON.stringify(addedCities));
  }, [addedCities]);

  function celsiusToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }
  function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5) / 9;
  }
  function kmhToMph(kmh) {
    return kmh * 0.62137;
  }
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
  const formatTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    // Get hours and minutes
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    // Convert hours to 12-hour format
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    // Determine AM or PM
    const meridiem = hours < 12 ? "AM" : "PM";
    // Format the time
    return `${hours12}:${minutes < 10 ? "0" : ""}${minutes} ${meridiem}`;
  };

  const handleSearchCity = async (value) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=50&language=en&format=json`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data.results);

      const modifiedArray = data?.results.map((obj, index) => {
        return {
          id: index,
          name: obj.name,
          latitude: obj.latitude,
          longitude: obj.longitude,
          value: obj.name,
          label: obj.name,
        };
      });

      const uniqueObjects = Array.from(
        new Set(modifiedArray.map((obj) => obj.name))
      ).map((name) => {
        return modifiedArray.find((obj) => obj.name === name);
      });

      setSuggestions(uniqueObjects);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleAddCity = async (
    index,
    cityName,
    cityLatitude,
    cityLongitude
  ) => {
    // Fetch suggestions based on input value
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&current_weather=true`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const cityData = await response.json();
      console.log("cityData", cityData);

      let cityTemperature = cityData?.current_weather?.temperature;
      let cityTemperatureUnit = cityData?.current_weather_units?.temperature;

      let cityWindSpeed = cityData?.current_weather?.windspeed;
      let cityWindSpeedUnit = cityData?.current_weather_units?.windspeed;

      let cityInfo = {
        id: index,
        idString: index.toString(),
        name: cityName,
        latitude: cityLatitude,
        longitude: cityLongitude,
        temperature: cityTemperature + cityTemperatureUnit,
        temperatureFahrenheit:
          celsiusToFahrenheit(cityTemperature).toFixed(2) + "°F",
        windSpeed: cityWindSpeed + cityWindSpeedUnit,
        windSpeedMiles: kmhToMph(cityWindSpeed).toFixed(2) + "miles/h",
      };

      //   setAddedCities([...addedCities, cityInfo]);

      let cities = [...addedCities, cityInfo];
      const uniqueCities = Array.from(
        new Set(cities.map((obj) => obj.name))
      ).map((name) => {
        return cities.find((obj) => obj.name === name);
      });
      setAddedCities(uniqueCities);

      console.log("addedCities", [...addedCities, cityInfo]);

      // setSuggestions(data.results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchWeeklyData = async (cityIndex, cityLatitude, cityLongitude) => {
    // Fetch suggestions based on input value
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max,sunrise,sunset,rain_sum`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      let dates = data.daily.time;

      setColumns([
        {
          title: formatDate(dates[0]),
          dataIndex: "0",
          key: 0,
        },
        {
          title: formatDate(dates[1]),
          dataIndex: "1",
          key: 1,
        },
        {
          title: formatDate(dates[2]),
          dataIndex: "2",
          key: 2,
        },
        {
          title: formatDate(dates[3]),
          dataIndex: "3",
          key: 3,
        },
        {
          title: formatDate(dates[4]),
          dataIndex: "4",
          key: 4,
        },
        {
          title: formatDate(dates[5]),
          dataIndex: "5",
          key: 5,
        },
        {
          title: formatDate(dates[6]),
          dataIndex: "6",
          key: 6,
        },
      ]);

      let sunrises = data.daily.sunrise.map(formatTime);
      let sunsets = data.daily.sunset.map(formatTime);
      let maxTemps = data.daily.temperature_2m_max;
      let minTemps = data.daily.temperature_2m_min;
      let rainfalls = data.daily.rain_sum;

      let maxTempUnit = data.daily_units.temperature_2m_max;
      let minTempUnit = data.daily_units.temperature_2m_min;
      let rainfallUnit = data.daily_units.rain_sum;

      setDatasource([
        {
          key: "0",
          0: sunrises[0],
          1: sunrises[1],
          2: sunrises[2],
          3: sunrises[3],
          4: sunrises[4],
          5: sunrises[5],
          6: sunrises[6],
        },
        {
          key: "1",
          0: sunsets[0],
          1: sunsets[1],
          2: sunsets[2],
          3: sunsets[3],
          4: sunsets[4],
          5: sunsets[5],
          6: sunsets[6],
        },

        {
          key: "2",

          0: maxTemps[0] + maxTempUnit,
          1: maxTemps[1] + maxTempUnit,
          2: maxTemps[2] + maxTempUnit,
          3: maxTemps[3] + maxTempUnit,
          4: maxTemps[4] + maxTempUnit,
          5: maxTemps[5] + maxTempUnit,
          6: maxTemps[6] + maxTempUnit,
        },
        {
          key: "3",
          0: minTemps[0] + minTempUnit,
          1: minTemps[1] + minTempUnit,
          2: minTemps[2] + minTempUnit,
          3: minTemps[3] + minTempUnit,
          4: minTemps[4] + minTempUnit,
          5: minTemps[5] + minTempUnit,
          6: minTemps[6] + minTempUnit,
        },
        {
          key: "4",

          0: rainfalls[0] + rainfallUnit,
          1: rainfalls[1] + rainfallUnit,
          2: rainfalls[2] + rainfallUnit,
          3: rainfalls[3] + rainfallUnit,
          4: rainfalls[4] + rainfallUnit,
          5: rainfalls[5] + rainfallUnit,
          6: rainfalls[6] + rainfallUnit,
        },
      ]);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const removeCity = (index) => {
    const updatedCities = [...addedCities];
    updatedCities.splice(index, 1);
    console.log("updatedCities", updatedCities);
    setAddedCities(updatedCities);
  };

  function handleOnDragEnd(result) {
    console.log("result", result);
    if (!result.destination) return;

    const items = Array.from(addedCities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAddedCities(items);
  }

  const onTempChange = (value) => {
    setCurrentTempUnit(value);

    if (datasource.length > 0) {
      if (value === "Fahrenheit") {
        // Loop through the maxTemp and minTemp Obj and convert Celsius to Fahrenheit
        for (let i = 2; i <= 3; i++) {
          const obj = datasource[i];
          Object.keys(obj).forEach((key) => {
            if (!key.includes("key")) {
              const value = obj[key];
              if (value.includes("°C")) {
                const celsius = parseFloat(value);
                const fahrenheit =
                  celsiusToFahrenheit(celsius).toFixed(1) + "°F";
                obj[key] = fahrenheit;
              }
            }
          });
        }
      } else {
        for (let i = 2; i <= 3; i++) {
          const obj = datasource[i];
          Object.keys(obj).forEach((key) => {
            if (!key.includes("key")) {
              const value = obj[key];
              if (value.includes("°F")) {
                const fahrenheit = parseFloat(value);
                const celsius =
                  fahrenheitToCelsius(fahrenheit).toFixed(1) + "°C";
                obj[key] = celsius;
              }
            }
          });
        }
      }
    }
  };

  const onWindChange = (value) => {
    setCurrentWindUnit(value);
  };
  return (
    <div>
      <div class="w-full flex flex-col mx-auto items-center gap-6 justify-around">
        <img src="/sun.png" className="w-[9rem] App-logo" alt="logo" />
        <Title level={1} className="space-grotesk-title text-gray-950	">
          Forecast Cities, One Tap at a Time!
        </Title>
        <AutoComplete
          suffixIcon={<SearchOutlined className="text-base" />}
          inputClassName="bg-gray-100 text-gray-900"
          className="shadow-sm w-3/5 h-10 text-left"
          options={suggestions}
          onSearch={handleSearchCity}
          onSelect={(value, option) => {
            handleAddCity(
              option.id,
              option.name,
              option.latitude,
              option.longitude
            );
          }}
          placeholder="Search for Cities"
        />
        {addedCities?.length > 0 && (
          <div className="flex gap-3 w-[44.5em] justify-end items-center mt-2 mb-0">
            <Text className="font-semibold">Select Units</Text>

            <Select
              defaultValue="Celcius"
              style={{
                width: 120,
              }}
              onChange={onTempChange}
              options={tempOptions}
            />

            <Select
              defaultValue="km/h"
              style={{
                width: 120,
              }}
              onChange={onWindChange}
              options={windOptions}
            />
          </div>
        )}
      </div>
      <div
        className="draggableCities"
        style={{ width: "100%", textAlign: "center" }}
      >
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="addedCities">
            {(provided) => (
              <ul
                className="addedCities flex flex-col p-2 md:p-3 gap-4 w-3/4 mx-auto"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {addedCities?.length > 0 ? (
                  addedCities?.map((city, index) => {
                    return (
                      <Draggable
                        key={city.id}
                        draggableId={city.name}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div
                              key={index}
                              style={{
                                display: "flex",
                              }}
                            >
                              <Collapse
                                className="bg-[#E9EBF6] w-full"
                                size="large"
                                activeKey={
                                  openPanelIndex === index ? "1" : null
                                }
                                onChange={(collapsed) => {
                                  setOpenPanelIndex(
                                    index === openPanelIndex ? null : index
                                  );

                                  if (collapsed.length > 0) {
                                    fetchWeeklyData(
                                      index,
                                      city.latitude,
                                      city.longitude
                                    );
                                  }
                                }}
                                items={[
                                  {
                                    key: "1",
                                    label: (
                                      <div className="flex flex-col justify-between">
                                        <div className="flex justify-between">
                                          <div class="flex flex-col items-start justify-start gap-4">
                                            <div className="align-center">
                                              <Title level={4}>
                                                {city.name}
                                              </Title>
                                            </div>
                                            <div className="flex gap-4">
                                              <Card
                                                size="small"
                                                title="Temperature"
                                                className="w-72 h-24 bg-[#EFF1F9] shadow-md"
                                              >
                                                <FireOutlined className="text-3xl" />
                                                {currentTempUnit === "Celcius"
                                                  ? city.temperature
                                                  : city.temperatureFahrenheit}
                                              </Card>
                                              <Card
                                                size="small"
                                                title="Wind Speed"
                                                className="w-72 h-24 bg-[#EFF1F9] shadow-md"
                                              >
                                                <ThunderboltOutlined className="text-3xl" />
                                                {currentWindUnit === "km/h"
                                                  ? city.windSpeed
                                                  : city.windSpeedMiles}
                                              </Card>

                                              <Card
                                                size="small"
                                                title="Precipitation Chance"
                                                className="w-72 h-24 bg-[#EFF1F9] shadow-md "
                                              >
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "4px",
                                                  }}
                                                >
                                                  <CloudOutlined className="text-3xl" />
                                                  {city.windSpeed}
                                                </div>
                                              </Card>
                                            </div>
                                          </div>
                                          <DeleteTwoTone
                                            twoToneColor="#ff5252"
                                            className="flex items-start text-[20px] text-red-500	"
                                            onClick={(e) => {
                                              removeCity(index);
                                            }}
                                          />
                                        </div>
                                        <Button
                                          shape="round"
                                          icon={<SearchOutlined />}
                                          type="dashed"
                                          className="w-64 mt-2"
                                        >
                                          View Weekly Forecast
                                        </Button>
                                      </div>
                                    ),

                                    children: (
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <div>
                                          <Table
                                            dataSource={parameterDatasource}
                                            pagination={false}
                                            columns={parameterColumns}
                                          />
                                        </div>
                                        <Table
                                          pagination={false}
                                          dataSource={datasource}
                                          columns={columns}
                                        />
                                      </div>
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })
                ) : (
                  <Empty description="Add Cities to Forecast" />
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default MainContent;
