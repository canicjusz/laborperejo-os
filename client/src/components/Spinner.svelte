<div class="spinner" />

<style lang="sass">
.spinner
  display: inline-block
  height: 40px
  width: 40px
  border-radius: 50%
  border: 4px solid #005ea9
  border-top-color: transparent
  animation: spin 0.75s linear 0s infinite normal none running
  
@keyframes spin 
  from 
    transform: rotate(0)

  to 
    transform: rotate(360deg)
</style>
