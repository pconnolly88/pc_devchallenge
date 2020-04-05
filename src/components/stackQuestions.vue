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
      <div v-if="debug>90">{{questionsData}}</div>    <!-- dump of question data for reference -->
      <!-- read of stackoverflow questions failed -->
      <section v-if="questionsState.failed">
        <p>Apologies! Currently not able to retrieve questions, please try back later</p>
        <p>Error: {{questionsState.error}}</p>
      </section>

      <section v-else>  <!-- still progress or successful -->
        <div v-if="questionsState.loading">Loading...</div>
        <div v-else>
          <section v-if="haveQuestions">
            <div v-if="debug>0">
              <p>{{quotaStatus}}</p>   <!-- shows quota remaining -->
            </div>

            <b-row>
              <b-col lg="2" class="pb-2">
                <b-button size="sm" @click="reloadQuestions">
                    Reload Questions
                </b-button>
              </b-col>
              <b-col lg="5" class="pull-left"><h4>{{questionCaption}}</h4></b-col>
            </b-row>
            <b-table  ref="questions" head-variant="dark"
                      responsive small striped hover  bordered outlined
                      :footClone="questionFootClone"
                      table-variant=success
                      selectable select-mode='single'
                      :items=questionItems :fields=questionFields
                      @row-selected="onQuestionSelected"
                      >
                <!--
                <template  class="text-md-left" v-slot:table-caption>
                    <strong>{{questionCaption}}</strong>
                </template>   -->
                <!-- A virtual column -->
                <template v-slot:cell(index)="data">
                  {{ data.index + 1 }}
                </template> 
             </b-table>
          </section>
        </div>
      </section>   
    </div>

    <!-- answers table - show when a question is selected -->
    <div v-if="answersState != null">
      <!-- Info modal - show when an answer is selected -->
      <b-modal :id="checkModal.id" :title="checkModal.title" ok-only @hide="resetCheckModal">
        <pre>{{ checkModal.contents }}</pre>
      </b-modal> 
      <div v-if="debug>50">{{answersData}}</div>
      <section v-if="answersState.failed">
        <p>Apologies! Currently not able to retrieve the answers, please try back later</p>
        <p>Error: {{answersState.error}}</p>
      </section>

      <section v-else>
        <div v-if="answersState.loading">Loading the answers...</div>
        <div v-else>
          <section v-if="haveAnswers"> 
            <b-row>
              <b-col lg="2" class="pb-2">
                  <b-button size="sm" @click="showAccepted">
                    Show Accepted Answer
                  </b-button>
              </b-col>
              <b-col lg="5" class="pull-left"><h4>{{answerCaption}}</h4></b-col>
            </b-row>
            <b-table  ref="answers" head-variant="dark"
                      responsive="sm" small striped hover bordered outlined
                      footClone
                      table-variant=info
                      selectable select-mode='single'
                      :items=answerItems :fields=answerFields
                      @row-selected="onAnswerSelected"
                      >
              <!--
              <template v-slot:table-caption><strong></strong>
              </template>  -->
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
import {QUESTIONS_QUERY, 
        //STACK_BASE_URL, STACK_END_URL,
        useStackApi, stackApiPromise} from '../functions/stackAPI.js';
//import axios from 'axios';

const QUESTIONS = "questions/";
const ANSWERS = "answers/";
const QUERY_SUFFIX = "?order=desc&sort=activity&filter=withbody";
const ANSWERS_SUFFIX = "/answers" + QUERY_SUFFIX;
const QUESTION_CAPTIONS = ["Select a question to see its answers",
                          "Selected Question" ];

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
      answerIdsResp: null,
      answersState: null,
      answerFields: [
                      'index',  // virtual column that doesn't exist in item
                      {key: 'body', label: 'Answer'},
                      {key: 'owner.display_name', label: 'Author'},
                       'score'
                       ],
      selectedA: null,
      questionFootClone: true,
      questionCaption: QUESTION_CAPTIONS[0],
      answerCaption: "Select an answer",
      checkModal: {
          id: 'guess-check',
          title: 'Guess Check',
          contents: ''
        },
      //tmp
      aTable: null,
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
    quotaStatus: function() {
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
        //axios.get(STACK_BASE_URL + query + STACK_END_URL)
        stackApiPromise(query)
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
 
    onQuestionSelected(item/*, index, event*/) {
      this.selectedQ = item;
      this.singleQuestion();
      //this.heading = "Guess the accepted answer";
      this.questionFootClone = false;
      this.questionCaption = QUESTION_CAPTIONS[1];
      this.findAnswers();
    },

    onAnswerSelected(item, /*index, event*/) {
        this.selectedA = item;
        if (item != null && item.length > 0) {
        // is this the accepted answer?
        var msg = "undefined";
        if (item[0].is_accepted) {
          const index = this.answerItems.findIndex(a => a.is_accepted)
          msg = "Nailed It!! Answer " + (index+1).toString() + " is the accepted answer."
        }
        else{
          const index = this.answerItems.findIndex(a => a.answer_id == item[0].answer_id)
          msg = "Sorry: Answer " + (index+1).toString() + " has NOT been accepted."
        }
        this.checkModal.contents = msg
        this.$root.$emit('bv::show::modal', this.checkModal.id)
      }
    },

    resetCheckModal() {
      this.checkModal.contents = ''
    },

    reloadQuestions() {
      this.answersState = null;
      this.selectedA = null;
      this.selectedQ = null;
      this.questionCaption = QUESTION_CAPTIONS[0];
      this.readQuestions();
    },

    showAccepted() {
      if (this.haveAnswers) {
        this.aTable = this.$refs.answers;
        var items = this.aTable.items;
        const acceptedIndex = items.findIndex(item => item.is_accepted);
        // make sure the row is in view - not sure how to find the javaScript element
        //items[acceptedIndex].scrollIntoView();
        this.$refs.answers.selectRow(acceptedIndex);
      }
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
