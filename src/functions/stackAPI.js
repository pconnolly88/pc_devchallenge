import { reactive } from "@vue/composition-api";
import axios from "axios";

const QUESTIONS_QUERY = "search/advanced?order=desc&sort=activity&accepted=True&answers=2&filter=withbody";
const STACK_BASE_URL = 'https://api.stackexchange.com/2.2/';
const STACK_END_URL = '&site=stackoverflow';
     
const useStackApi = (api) => {
  const state = reactive({
    info: null,
    error: null,
    loading: true,
    failed: false
  });
    axios
      .get(STACK_BASE_URL + api + STACK_END_URL)
      .then(response => {
        console.log("useStackApi: response:" + response);
        if (response.status > 299) {
            state.failed = true;
            state.error = response;
        }
        else
            state.info = response.data;
      })
      .catch(error => {
        state.error = error;
        console.log(error);
        state.failed = true;
      })
      .finally(() => (state.loading = false));
  return state;
};

const stackApiPromise = (api) => {
    const axios = require('axios');
    // return the promise so the caller can wait for competion with .then etc
    return (
        axios.get(STACK_BASE_URL + api + STACK_END_URL)
    );
};

export {QUESTIONS_QUERY, STACK_BASE_URL, STACK_END_URL, 
        useStackApi, stackApiPromise};