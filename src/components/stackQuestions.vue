<template>
  <div class="stackQuestions">
    <h1>Select a Question</h1>
    <div v-if=false class="container"> 
      <div class="text-left"> 
        <b-button variant="primary" @click="readQuestions">Load Questions</b-button>
      </div>
    </div>
    <div v-if="debug>0 && haveAnswers">{{answerItems}}</div>
    <div v-if="debug>90">{{questionsData}}</div>
    <section v-if="questionsState.getError">
      <p>Apologies! Currently not able to retrieve this information, please try back later</p>
      <p>Error: {{questionsState.errorMsg}}</p>
    </section>

    <section v-else>
      <div v-if="loading">Loading...</div>

      <div v-else>
        <section v-if="haveQuestions">
          <div v-if="debug>0">
           <p>{{questionsTitle}}</p>
         </div>
         <b-table responsive small striped hover table-variant=success
                  selectable select-mode='single'
                  :items=questionItems :fields=tableFields
                  @row-selected="onRowSelected"
                  >
         </b-table>
         <div v-if="answersResponse != null">{{answersResponse}}</div>
        </section>
      </div>
    </section>   
  </div>
</template>

<script>
import { useStackApi, QUESTIONS_QUERY } from '../functions/stackAPI.js';

export default {
  name: 'stackQuestions',
  props: {
    questionsState: null
  },
  data: function() {
    return {
      answersState: null,
      //axiosResponse: null,
      debug: 1,
      selectedRow: null,
      tableFields: ['title', 'owner.display_name', 'answer_count']
    }
  },
  computed: {
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
      return this.selectedRow != null ? this.selectedRow.question_id : -1
    },
  },
  methods: {
    // read the first group of questions with multiple answers from stackoverflow.com
    readQuestions() {
      this.questionsState = useStackApi(QUESTIONS_QUERY);
    },
    // read the answers for the selected question
    readAnswers() {
      if (this.questionId != null) {
        const Q_ANSWERS_SUFFIX = "/answers?order=desc&sort=activity";
        const ANSWERS_SUFFIX = "/answers?order=desc&sort=activity";

        var query = 'questions/' + this.questionId + Q_ANSWERS_SUFFIX;
        // first read the answer ids for the question
        var answerIdsState = useStackApi(query);
        // then read the answer details 
        if (answerIdsState != null) {
          var commaIds = 
            Array.prototype.map.call(answerIdsState.info.data.items, s => s.answer_id).toString(); // "A,B,C"
          var ids = commaIds.replace(',', ';');      
          query = "answers/" + ids + ANSWERS_SUFFIX;
          this.answersState = useStackApi(query);
        }
      }
    },
 
    onRowSelected(row) {
      this.selectedRow = row;
      this.readAnswers();
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
