<script lang="ts">
  import { appName, appTagline } from './lib/app-info';
</script>

<main>
  <h1>{appName}</h1>
  <p>{appTagline}</p>
  <p class="status">Coming soon.</p>
</main>

<style>
  main {
    max-width: 40rem;
    margin: 0 auto;
    padding: 3rem 1rem;
  }

  .status {
    color: var(--muted);
  }
</style>
