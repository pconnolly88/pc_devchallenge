<template>
  <div id="app">
    <img alt="Stack logo" src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-icon.png?v=c78bd457575a"/>
    <stackQuestions msg="Welcome to: Guess the Accepted Answer"/>
  </div>
</template>

<script>
import stackQuestions from './components/stackQuestions.vue'

export default {
  name: 'App',
  components: {
    stackQuestions
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
