import { create } from "zustand";
import { dataManagementService } from "../services/DataManagementService";
import { ThemeData } from "../../dataManagement";

interface CurrentDataStore {
    currentData: ThemeData,
    setData: (data: ThemeData) => void;
}

export const useCurrentDataStore = create<CurrentDataStore>((set) => ({
    currentData: dataManagementService.getData(),
    setData: (data: ThemeData) => {
        set({currentData: data})
    }
}))

dataManagementService.onChange(() => {
    useCurrentDataStore.setState({currentData: dataManagementService.getData()})
});