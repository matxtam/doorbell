import { configureStore, createSlice } from "@reduxjs/toolkit";

const lockerSlice = createSlice({
  name: "locker",
  initialState: { value: false },
  reducers: {
    toggle: (state) => {
      state.value = !state.value;
    },
  },
});

export const { toggle } = lockerSlice.actions;
export const store = configureStore({
  reducer: {
    locker: lockerSlice.reducer,
  },
});
