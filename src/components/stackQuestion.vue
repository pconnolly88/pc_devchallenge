<template>
  <div class="stackQuestion">
      <h3>{{ question.title }}</h3>
      <p> author: {{question.author}} </p>
      <p> answers: {{question.answer_count}} </p>
    </div>
</template>

<script>
export default {
  name: 'stackQuestion',
  props: {
    question : null 
  }
}
</script>
