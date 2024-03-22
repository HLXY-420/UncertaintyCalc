import React, { createContext, useState } from "react";

interface variableData {
    value: String,
    uncertainty: String
}

interface Data {
    numberOfComponents: number;
    componentsData: variableData[];
    updateData: (componentId: number, updatedData: variableData) => void;
}

const DataContext = createContext<Data | null>(null);

const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [numberOfComponents, setNumberOfComponents] = useState(0);
    const [componentsData, setComponentsData] = useState<variableData[]>([]);
  
    const updateData = (componentId: number, updatedData: variableData) => {
      setComponentsData((prevData) => {
        const newData = [...prevData];
        newData[componentId] = updatedData;
        return newData;
      });
    };
  
    React.useEffect(() => {
      setComponentsData(Array(numberOfComponents).fill({ value: '' }));
    }, [numberOfComponents]);
  
    return (
      <DataContext.Provider
        value={{ numberOfComponents, componentsData, updateData }}
      >
        {children}
      </DataContext.Provider>
    );
  };
  
  export { DataContext, DataProvider }; 