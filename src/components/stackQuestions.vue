<template>
  <div class="stackQuestions">
    <h1>{{heading}}</h1>
    <div v-if=false class="container"> 
      <div class="text-left"> 
        <b-button variant="primary" @click="readQuestions">Load Questions</b-button>
      </div>
    </div>

    <!-- questions table -->
    <div v-if="questionsState != null">
      <div v-if="debug>90">{{questionsData}}</div>
      <section v-if="questionsState.failed">
        <p>Apologies! Currently not able to retrieve questions, please try back later</p>
        <p>Error: {{questionsState.error}}</p>
      </section>

      <section v-else>
        <div v-if="questionsState.loading">Loading...</div>
        <div v-else>
          <section v-if="haveQuestions">
            <div v-if="debug>0">
            <p>{{questionsTitle}}</p>
          </div>
            <b-table responsive small striped hover table-variant=success
                      selectable select-mode='single'
                      :items=questionItems :fields=questionFields
                      @row-selected="onQuestionSelected"
                      >
            </b-table>
          </section>
        </div>
      </section>   
    </div>

    <!-- answerIds - these have to read before the answeres.
         There will be a "loading..." while we wait for this at times -->
    <div v-if="answerIdsState != null">
        <div v-if="answerIdsState.loading">Loading ids of the answers...</div>
    </div>
    <!-- answers table -->
    <div v-if="answersState != null">
      <div v-if="debug>50">{{answersData}}</div>
      <section v-if="answersState.failed">
        <p>Apologies! Currently not able to retrieve the answers, please try back later</p>
        <p>Error: {{answersState.error}}</p>
      </section>

      <section v-else>
        <div v-if="answersState.loading">Loading the answers...</div>
        <div v-else>
          <section v-if="haveAnswers"> 
            <b-table responsive small striped hover table-variant=light
                      selectable select-mode='single'
                      :items=answerItems :fields=answerFields
                      @row-selected="onAnswerSelected"
                      >
            </b-table>
          </section>
        </div>
      </section> 
    </div>
    
  </div>
</template>

<script>
import {QUESTIONS_QUERY, STACK_BASE_URL, STACK_END_URL,
        useStackApi} from '../functions/stackAPI.js';
import axios from 'axios';

const QUESTIONS = "questions/";
const ANSWERS = "answers/";
const QUERY_SUFFIX = "?order=desc&sort=activity&filter=withbody";
const ANSWERS_SUFFIX = "/answers" + QUERY_SUFFIX;

export default {
  name: 'stackQuestions',
  props: {
    qState: null
  }, 
  data: function() {
    return {
      heading: "Select a Question",
      qStateLocal: null,
      selectedQ: null,
      questionFields: ['title', 'owner.display_name', 'answer_count'],
      answerIdsState: null,
      answerIdsResp: null,
      answersState: null,
      answerFields: ['body', 'owner.display_name', 'score'],
      selectedA: null,
      acceptedA: null,
      //tmp
      ids: "",
      query: "",
      //
      debug: 0
    }
  },
  computed: {
    questionsState: function() {
      return this.qStateLocal != null ? this.qStateLocal : this.qState;
    },
    haveQuestions: function() {
        return this.questionsState != null
    },
    loading: function() {
      return this.haveQuestions ? this.questionsState.loading : false
    },
    questionsData: function() {
      return this.haveQuestions ? this.questionsState.info : null
    },
    questionsTitle: function() {
      return  this.haveQuestions ?  
                "quota_remaining= " + this.questionsData.quota_remaining +
                ", quota_max= " + this.questionsData.quota_max +"."
                : ""
    },
    questionItems: function() {
      return this.haveQuestions ? this.questionsData.items : null;
    },
    haveAnswers: function() {
        return this.answersState != null
    },
    answersData: function() {
      return this.haveAnswers ? this.answersState.info : null
    },
    answerItems: function() {
      return this.haveAnswers ? this.answersData.items : null
    },
    questionId: function() {
      return this.selectedQ != null && this.selectedQ.length > 0 ? 
              this.selectedQ[0].question_id : -1
    },
  },
  // lifecycle events
  updated: {
    
  },
  methods: {
    // read the first group of questions with multiple answers from stackoverflow.com
    readQuestions() {
      this.qStateLocal = useStackApi(QUESTIONS_QUERY);
    },
    // read the answers for the selected question
    findAnswers() {
      if (this.questionId != null) {
        this.selectedA = null;
        this.acceptedA = null;
        
        // first read the answer ids for the question
        // cannot proceed until the call completes - so need stackAPiPromise
        var query = QUESTIONS + this.questionId + ANSWERS_SUFFIX;
        // cannot figure out how to get this work any pretty way -so need local axios
//        const axios = require('axios');
        axios.get(STACK_BASE_URL + query + STACK_END_URL)
          .then(response => {
            this.answerIdsResp = response;
            console.log("stackApi: response:" + response);
            if (response.status > 299) {
                console.error("stackApi failed.  Status: " + response.status)
            }
            else { // need to do anything needing the response here - due to asynchronicity
                this.readAnswers(this.collectIds(response.data.items))
            }
          })
          .catch(error => {
            console.error("stackApi Exception: " + error);
          });
      }
    },

    collectIds(items) {
      var ids = "";
      if (items != null) {
        for (const item of items) {
          ids += item.answer_id + ";";
        }
        ids = ids.slice(0,-1)
      }
      return ids;
    },

    readAnswers(ids) {
      if (ids.length > 0) {
          this.query = ANSWERS + ids + QUERY_SUFFIX;
          this.answersState = useStackApi(this.query);
      }
    },
    
    // replace the questionItems with the single selected question
    singleQuestion() {
      if (this.selectedQ != null) {
        var query = QUESTIONS + this.questionId + QUERY_SUFFIX; 
        this.qStateLocal = useStackApi(query);   
      }
    },
 
    onQuestionSelected(row) {
      this.selectedQ = row;
      this.singleQuestion();
      this.heading = "Guess the accepted answer";
      this.findAnswers();
    },

    onAnswerSelected(row) {
      this.selectedA = row;
      // is this the accepted answer?
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 20px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
