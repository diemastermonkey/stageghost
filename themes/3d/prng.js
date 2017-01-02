//Webkit2's crazy invertible mapping generator
var invwk = (function() {
  var max = Math.pow(2, 32),
      seed;
  return {
    setSeed : function(val) {
      seed = val || Math.round(Math.random() * max);
    },
    getSeed : function() {
      return seed;
    },
    rand : function() {
      // creates randomness...somehow...
      seed += (seed * seed) | 5;
      // Shift off bits, discarding the sign. Discarding the sign is
      // important because OR w/ 5 can give us + or - numbers.
      return (seed >>> 32) / max;
    }
  };
}());
