<template>
  <div id="app">
    <b-img left alt="Stack logo" height=45 class="m1"
      src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-logo.png?v=9c558ec15d8a"/>
    <stackQuestions msg="Guess the Accepted Answer"/>
    <div class="navbar navbar-default navbar-fixed-bottom">
      <div class="container">
        <p class="navbar-text pull-left">© 2020 - Site built by Paul Connolly (logo © stackoverflow)
           <a href="http://tinyurl.com/tbvalid" target="_blank" >HTML 5 Validation</a>
        </p>
      </div>
    </div> 
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
