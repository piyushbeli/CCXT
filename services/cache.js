'use strict';

// In real we should be using some shared cache like Redis, Memcache.
// For this job we should cache the result until next time the job is run so that we don't need to reach the DB everytime