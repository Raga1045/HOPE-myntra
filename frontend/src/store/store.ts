import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Profile {
  state: string;
  festivals: string[];
  language: string;
}

interface SessionState {
  user: User | null;
  profile: Profile | null;
  cultureMode: boolean;
}

const initialSessionState: SessionState = {
  user: null,
  profile: null,
  cultureMode: true, // Default Culture ON
};

const sessionSlice = createSlice({
  name: 'session',
  initialState: initialSessionState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('myntra_user', JSON.stringify(action.payload));
      }
    },
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('myntra_profile', JSON.stringify(action.payload));
      }
    },
    toggleCultureMode: (state) => {
      state.cultureMode = !state.cultureMode;
    },
    clearSession: (state) => {
      state.user = null;
      state.profile = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('myntra_user');
        localStorage.removeItem('myntra_profile');
      }
    },
    initializeSession: (state) => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('myntra_user');
        const savedProfile = localStorage.getItem('myntra_profile');
        if (savedUser) state.user = JSON.parse(savedUser);
        if (savedProfile) state.profile = JSON.parse(savedProfile);
      }
    }
  }
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  image: string;
}

interface CartState {
  items: CartItem[];
}

const initialCartState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { setUser, setProfile, toggleCultureMode, clearSession, initializeSession } = sessionSlice.actions;
export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
