import { reactive } from "@vue/composition-api";
import axios from "axios";

const QUESTIONS_QUERY = "search/advanced?order=desc&sort=activity&accepted=True&answers=2";

const useStackApi = (api) => {
  const state = reactive({
    info: null,
    loading: true,
    errorMsg: null,
    getError: false
  });
   const STACK_BASE_URL = "https://api.stackexchange.com/2.2/";
   const STACK_END_URL = "&site=stackoverflow";
    axios
      .get(STACK_BASE_URL + api + STACK_END_URL)
      .then(response => {
        state.info = response.data;
      })
      .catch(error => {
        state.errorMsg = error;
        console.log(error);
        state.getError = true;
      })
      .finally(() => (state.loading = false));
  return state;
};

export {QUESTIONS_QUERY, useStackApi};