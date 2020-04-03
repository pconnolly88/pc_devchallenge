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
            <b-table  head-variant="dark"
                      responsive small striped hover  bordered outlined
                      caption-top
                      :footClone="questionFootClone"
                      table-variant=success
                      selectable select-mode='single'
                      :items=questionItems :fields=questionFields
                      @row-selected="onQuestionSelected"
                      >
                <template  v-slot:table-caption>
                          <strong>{{questionCaption}}</strong>
                </template>
                <!-- A virtual column -->
                <template v-slot:cell(index)="data">
                  {{ data.index + 1 }}
                </template> 
             </b-table>
          </section>
        </div>
      </section>   
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
            <b-table  head-variant="dark"
                      responsive="sm" small striped hover bordered outlined
                      footClone caption-top
                      table-variant=info
                      selectable select-mode='single'
                      :items=answerItems :fields=answerFields
                      @row-selected="onAnswerSelected"
                      >
              <template v-slot:table-caption><strong>{{answerCaption}}</strong>
              </template>
              <!-- A virtual column -->
              <template v-slot:cell(index)="data">
                {{ data.index + 1 }}
              </template> 
              <!-- custom formatting for answer body -->
              <template v-slot:cell(body)="data"> 
                <p class="text-sm-left" v-html="data.value"></p>
              </template>
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
const QUESTION_CAPTIONS = ["   Select a Question to see its answers",
                          "   Selected Question" ];

export default {
  name: 'stackQuestions',
  props: {
    qState: null
  }, 
  data: function() {
    return {
      heading: "Guess the Accepted Answer",
      qStateLocal: null,
      selectedQ: null,
      questionFields: [
                        'index',  // virtual column that doesn't exist in item
                        {key: 'title', label: 'Question'}, 
                        {key: 'owner.display_name', label: 'Author' },
                        'answer_count'
                      ],
      answerIdsState: null,
      answerIdsResp: null,
      answersState: null,
      answerFields: [
                      'index',  // virtual column that doesn't exist in item
                      {key: 'body', label: 'Answer'},
                      {key: 'owner.display_name', label: 'Author'},
                       'score'
                       ],
      selectedA: null,
      acceptedA: null,
      questionFootClone: true,
      questionCaption: QUESTION_CAPTIONS[0],
      answerCaption: "   To guess the accepted answer: select an answer",
      //tmp
      // ids: "",
      // query: "",
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
            if (this.debug > 0)
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
          const query = ANSWERS + ids + QUERY_SUFFIX;
          this.answersState = useStackApi(query);
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
      //this.heading = "Guess the accepted answer";
      this.questionFootClone = false;
      this.questionCaption = QUESTION_CAPTIONS[1];
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
