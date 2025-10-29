import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './reducers/auth.slice';

const rootReducer = combineReducers({
  auth: authReducer,
});

type RootReducerType = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootReducerType> = {
  key: 'nitroRoot',
  storage: AsyncStorage,
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
