import { LLMConfig } from "@/types/llm_config";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserConfigState {
  can_change_keys: boolean
  llm_config: LLMConfig
  auth_user: {
    username: string | null
    role: "admin" | "user" | null
  }
}

const initialState: UserConfigState = {
  llm_config: {
    LLM: "openai",
    IMAGE_PROVIDER: "gpt-image-1.5",

  },
  can_change_keys: false,
  auth_user: {
    username: null,
    role: null,
  },
}

const userConfigSlice = createSlice({
  name: "userConfig",
  initialState: initialState,
  reducers: {
    setLLMConfig: (state, action: PayloadAction<LLMConfig>) => {
      state.llm_config = action.payload;
    },
    setCanChangeKeys: (state, action: PayloadAction<boolean>) => {
      state.can_change_keys = action.payload;
    },
    setAuthUser: (
      state,
      action: PayloadAction<{ username: string | null; role: "admin" | "user" | null }>
    ) => {
      state.auth_user = action.payload;
    }
  },
});

export const { setLLMConfig, setCanChangeKeys, setAuthUser } = userConfigSlice.actions;
export default userConfigSlice.reducer;
