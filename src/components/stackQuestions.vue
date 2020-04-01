<template>
  <div class="stackQuestions">
    <h1>{{ msg }}</h1>
    <div class="container"> 
      <div class="text-left"> 
        <b-button variant="primary" @click="readQuestions">Load Questions</b-button>
      </div>
    </div>
    <section v-if="errorMsg.length">
      <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      <p>Error: {{errorMsg}}</p>
    </section>

    <section v-else>
      <div v-if="loading">Loading...</div>

      <div v-else>
        <b-card v-if="this.stackResponse != null"
         :title=this.responseTitle
         tag="article"
         class="mb-6"
        >
         <div v-if="false">
           {{stackResponse}}
         </div>
          <stackQuestion
            v-for="question in this.responseItems"
            :key= question.question_id
            :question="question"
          />
        </b-card>
      </div>
    </section>   
  </div>
</template>

<script>
import stackQuestion from './stackQuestion.vue'

export default {
  name: 'stackQuestions',
  components: {
    stackQuestion
  },
  props: {
    msg: String
  },
  data: function() {
    return {
      stackResponse: null,
      loading: false,
      errorMsg: "",
      stackURL: "https://api.stackexchange.com/2.2/search/advanced?" +
        "order=desc&sort=activity&accepted=True&answers=2&site=stackoverflow"
    }
  },
  computed: {
    responseTitle: function() {
      return this.stackResponse == null ? "" : 
                "quota_remaining= " + this.stackResponse.data.quota_remaining +
                ", quota_max= " + this.stackResponse.data.quota_max +"."
    },
    responseItems: function() {
      return this.stackResponse == null ? null : this.stackResponse.data.items;
    }

  },
  methods: {
    // read the first group of questions with multiple answers from stackoverflow.com
    readQuestions() {
    var axios = require('axios')
    axios
      .get(this.stackURL)
      .then(response => (this.stackResponse = response))
      .catch(error => {
        console.log(error)
        this.errorMsg = error
      })
      .finally(() => this.loading = false)
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
