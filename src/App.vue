<template>
  <div id="app">
    <b-img left alt="Stack logo" height=45 class="m1"
      src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-logo.png?v=9c558ec15d8a"/>
    <!-- couldn't get the question to populate itself in the component - so pass in
         the initial list.  Certainly I am missing something? -->  
    <stackQuestions :qState="state"/>
    
    <div class="navbar navbar-default navbar-fixed-bottom">
      <div class="container">
        <p class="navbar-text pull-left">© 2020 - site built by Paul Connolly (logo © stackoverflow)
           <a href="http://tinyurl.com/tbvalid" target="_blank" >HTML 5 Validation</a>
        </p>
      </div>
    </div> 
  </div>
</template>

<script>
import stackQuestions from './components/stackQuestions.vue'
import { useStackApi, QUESTIONS_QUERY } from './functions/stackAPI.js'

export default {
  name: 'App',
  components: {
    stackQuestions
  },
  setup() {
    const state = useStackApi(QUESTIONS_QUERY);
    return { state };   
  },
  created() {
    console.log("page created.")
  },
  mounted() {
    console.log("page mounted");
  },
  updated() {
    console.log("page updated")
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}

</style>
