import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/src/api/axios-instance";

// Тип для фичи с бэкенда
export interface FeatureDto {
  id: number;
  internal_name: string;
  description: Record<string, string>;
  icon_url: string | null;
}

// Тип для настроек с бэкенда (Settings)
export interface SettingDto {
  key: string;
  value: string;
  description: string;
}

interface DictionariesState {
  features: FeatureDto[];
  settings: Record<string, any>; // Будем хранить как объект ключ-значение для быстрого доступа
  isLoading: boolean;
}

const initialState: DictionariesState = {
  features: [],
  settings: {},
  isLoading: false,
};

// Запрашиваем всё одним Promise.all для скорости
export const fetchDictionaries = createAsyncThunk(
  "dictionaries/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const [featuresRes, settingsRes] = await Promise.all([
        axiosInstance.get<FeatureDto[]>("/features"),
        axiosInstance.get<SettingDto[]>("/settings"),
      ]);

      // Преобразуем массив настроек в удобный объект (парсим JSON-значения, если это списки марок/цветов)
      const settingsMap: Record<string, any> = {};
      settingsRes.data.forEach((s) => {
        try {
          settingsMap[s.key] = JSON.parse(s.value); // Если там '["BMW", "Audi"]' - станет массивом
        } catch {
          settingsMap[s.key] = s.value; // Если просто строка - оставляем строкой
        }
      });

      return {
        features: featuresRes.data,
        settings: settingsMap,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const dictionariesSlice = createSlice({
  name: "dictionaries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDictionaries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDictionaries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.features = action.payload.features;
        state.settings = action.payload.settings;
      })
      .addCase(fetchDictionaries.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default dictionariesSlice.reducer;
